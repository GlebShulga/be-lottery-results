"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastBonolotoResults = exports.getBonolotoResults = exports.getLoteriasData = void 0;
const axios_1 = __importDefault(require("axios"));
const date_1 = require("../utils/date");
const date_2 = require("../constants/date");
const responseCodes_1 = require("../constants/responseCodes");
const number_1 = require("../utils/number");
async function getLoteriasData(startDate, endDate) {
    const baseURL = process.env.BONOLOTO_API;
    const startDateQuery = process.env.START_DATE;
    const endDateQuery = process.env.END_DATE;
    const url = `${baseURL}&${startDateQuery}=${startDate}&${endDateQuery}=${endDate}`;
    try {
        const response = await axios_1.default.get(url);
        return response.data;
    }
    catch (error) {
        console.error(error);
    }
}
exports.getLoteriasData = getLoteriasData;
async function getBonolotoResults(req, res) {
    const { numbers } = req.body;
    const sequenceToCheck = (0, number_1.convertNumbersToStrings)(numbers);
    async function processData(startDate, endDate) {
        try {
            const data = await getLoteriasData(startDate, endDate);
            if (!data) {
                console.error("Data did not fetch correctly.");
                return;
            }
            const combinacion = data.map((draw) => draw.combinacion);
            const result = combinacion.find((str) => {
                const numbers = str.split(" - ").map((num) => num.slice(0, 2));
                return sequenceToCheck.every((seq) => numbers.includes(seq));
            });
            if (!result && data.length > 0) {
                const lastDate = new Date(data[data.length - 1].fecha_sorteo);
                const newEndDate = (0, date_1.formatDate)(lastDate);
                if (newEndDate === date_2.LOTTERY_START_DATE) {
                    console.log("Didn't find a sequence match. Exiting.");
                    res.status(responseCodes_1.RESPONSE_CODE_OK).json({
                        drawResult: [],
                        drawDate: null,
                        error: null,
                    });
                    return;
                }
                if (newEndDate.substring(4) === date_2.FIRST_JAN || data.length < 10) {
                    const prevYear = parseInt(startDate.substring(0, 4)) - 1;
                    startDate =
                        prevYear === date_2.LOTTERY_START_YEAR
                            ? date_2.LOTTERY_START_DATE
                            : `${prevYear}${date_2.FIRST_JAN}`;
                    console.log("Switching startDate to previous year:", startDate);
                    await processData(startDate, newEndDate);
                }
                else {
                    console.log("Updating endDate to:", newEndDate);
                    await processData(startDate, newEndDate);
                }
            }
            else {
                const drawDate = data.find((draw) => draw.combinacion === result)?.fecha_sorteo ?? "";
                const dateOnly = drawDate.split(" ")[0];
                console.log("Find your numbers:", result, "in draw on", dateOnly);
                res.status(responseCodes_1.RESPONSE_CODE_OK).json({
                    drawResult: result,
                    drawDate: dateOnly,
                    error: null,
                });
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    const endDate = (0, date_1.formatDate)(new Date());
    const startDate = (0, date_1.formatDate)(new Date(new Date().getFullYear(), 0, 1));
    processData(startDate, endDate);
}
exports.getBonolotoResults = getBonolotoResults;
async function getLastBonolotoResults(req, res) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 10);
    const formattedStartDate = (0, date_1.formatDate)(startDate);
    const formattedEndDate = (0, date_1.formatDate)(endDate);
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
    res.status(responseCodes_1.RESPONSE_CODE_OK).json({
        results,
    });
}
exports.getLastBonolotoResults = getLastBonolotoResults;
