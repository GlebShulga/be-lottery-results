import { Request, Response } from "express";
import axios from "axios";
import { formatDate } from "../utils/date";
import {
  FIRST_JAN,
  LOTTERY_START_DATE,
  LOTTERY_START_YEAR,
  TEN_DAYS,
} from "../constants/date";
import { RESPONSE_CODE_OK } from "../constants/responseCodes";
import { convertNumbersToStrings } from "../utils/number";
import { BonolotoResult } from "./type";

export async function getLoteriasData(
  startDate: string,
  endDate: string
): Promise<BonolotoResult[] | undefined> {
  const baseURL = process.env.BONOLOTO_API;
  const startDateQuery = process.env.START_DATE;
  const endDateQuery = process.env.END_DATE;
  const url = `${baseURL}&${startDateQuery}=${startDate}&${endDateQuery}=${endDate}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getBonolotoResults(req: Request, res: Response) {
  const { numbers } = req.body;
  const sequenceToCheck = convertNumbersToStrings(numbers);

  async function processData(startDate: string, endDate: string) {
    try {
      const data = await getLoteriasData(startDate, endDate);

      if (!data) {
        console.error("Data did not fetch correctly.");
        return;
      }

      const combinacion = data.map((draw) => draw.combinacion);

      const result = combinacion.find((str: string) => {
        const numbers = str.split(" - ").map((num) => num.slice(0, 2));
        return sequenceToCheck.every((seq: string) => numbers.includes(seq));
      });

      if (!result && data.length > 0) {
        const lastDate = new Date(data[data.length - 1].fecha_sorteo);
        const newEndDate = formatDate(lastDate);

        if (newEndDate === LOTTERY_START_DATE) {
          console.log("Didn't find a sequence match. Exiting.");
          res.status(RESPONSE_CODE_OK).json({
            drawResult: [],
            drawDate: null,
            error: null,
          });
          return;
        }
        if (newEndDate.substring(4) === FIRST_JAN || data.length < 10) {
          const prevYear = parseInt(startDate.substring(0, 4)) - 1;
          startDate =
            prevYear === LOTTERY_START_YEAR
              ? LOTTERY_START_DATE
              : `${prevYear}${FIRST_JAN}`;
          console.log("Switching startDate to previous year:", startDate);
          await processData(startDate, newEndDate);
        } else {
          console.log("Updating endDate to:", newEndDate);
          await processData(startDate, newEndDate);
        }
      } else {
        const drawDate =
          data.find((draw) => draw.combinacion === result)?.fecha_sorteo ?? "";
        const dateOnly = drawDate.split(" ")[0];
        console.log("Find your numbers:", result, "in draw on", dateOnly);
        res.status(RESPONSE_CODE_OK).json({
          drawResult: result,
          drawDate: dateOnly,
          error: null,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  const endDate = formatDate(new Date());
  const startDate = formatDate(new Date(new Date().getFullYear(), 0, 1));

  processData(startDate, endDate);
}

export async function getLastBonolotoResults(req: Request, res: Response) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - TEN_DAYS);
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  const data = await getLoteriasData(formattedStartDate, formattedEndDate);

  const results = data?.map((draw) => {
    const numbers = draw.combinacion
      .split(/ - | /)
      .map((s) => s.replace(/[\(\) ]/g, ""));
    const date = draw.fecha_sorteo.split(" ")[0];

    return {
      date,
      numbers,
      prizes: draw.escrutinio,
    };
  });

  res.status(RESPONSE_CODE_OK).json({
    results,
  });
}
