export function convertNumbersToStrings(numbers: number[]): string[] {
  return numbers.map((number) => (number < 10 ? `0${number}` : `${number}`));
}
