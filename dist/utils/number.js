"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNumbersToStrings = void 0;
function convertNumbersToStrings(numbers) {
    return numbers.map((number) => (number < 10 ? `0${number}` : `${number}`));
}
exports.convertNumbersToStrings = convertNumbersToStrings;
