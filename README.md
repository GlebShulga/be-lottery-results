# Lottery Sequence Checker

This application checks for the occurrence of a specific sequence of numbers in the results of a lottery game. The sequence is hard-coded as `["01", "03", "12", "15"]`. You can change the sequence by modifying the `sequenceToCheck` variable in the `app.js` file.

## How it works

The application fetches Bonoloto lottery data from a specific URL using the `axios` library. The data is filtered to check if the specific sequence of numbers exists in the lottery results. If the sequence is not found, the application recursively fetches data for previous years until it either finds the sequence or reaches the start date of the lottery game.

## Setup

1. Install Node.js and npm if you haven't already.
2. Clone this repository.
3. Run `npm install` to install the required dependencies.

## Running the application

Please ping me for the URL of the lottery API. The URL is not included in the repository for privacy reasons.

Run `node ./script/app.js` to start the application. The application will fetch lottery data and check for the specific sequence of numbers. The results will be logged to the console.

## Dependencies

- `axios`: Used to make HTTP requests to fetch lottery data.

## Note

This application is a demonstration of how to fetch and process data in Node.js. It is not intended to be used for actual lottery predictions or analysis.
