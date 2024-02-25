const axios = require("axios");

const FIRST_JAN = "0101";
const LOTTERY_START_DATE = "19870101";

function formatDate(date) {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}${month}${day}`;
}

async function getLoteriasData(startDate, endDate) {
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

async function processData(startDate, endDate) {
  try {
    const data = await getLoteriasData(startDate, endDate);

    const combinacion = data.map((rec) => rec.combinacion);

    const sequenceToCheck = ["01", "03", "12", "15"];
    const result = combinacion.filter((str) => {
      const numbers = str.split(" - ").map((num) => num.slice(0, 2));
      return sequenceToCheck.every((seq) => numbers.includes(seq));
    });

    if (result.length === 0 && data.length > 0) {
      const lastDate = new Date(data[data.length - 1].fecha_sorteo);
      const newEndDate = formatDate(lastDate);
      if (newEndDate.substring(4) === FIRST_JAN || data.length < 10) {
        const prevYear = parseInt(startDate.substring(0, 4)) - 1;
        startDate = `${prevYear}${FIRST_JAN}`;
        if (startDate < LOTTERY_START_DATE) {
          console.log("Didn't find a sequence match. Exiting.");
          return;
        }
        console.log("Switching startDate to previous year:", startDate);
        await processData(startDate, newEndDate);
      } else {
        console.log("Updating endDate to:", newEndDate);
        await processData(startDate, newEndDate);
      }
    } else {
      const resultDate = data.find(
        (draw) => draw.combinacion === result[0]
      ).fecha_sorteo;
      console.log("Find your numbers:", result, "in draw on", resultDate);
    }
  } catch (error) {
    console.error(error);
  }
}

const endDate = formatDate(new Date());
const startDate = formatDate(new Date(new Date().getFullYear(), 0, 1));

processData(startDate, endDate);
