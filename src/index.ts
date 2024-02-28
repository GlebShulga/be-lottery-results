var cors = require("cors");
import * as dotenv from "dotenv";
import express, { Application } from "express";
import net from "net";
import bodyParser from "body-parser";
import debug from "debug";
import {
  RESPONSE_CODE_OK,
  RESPONSE_CODE_SERVER_ERROR,
} from "./constants/responseCodes";
import {
  getBonolotoResults,
  getLastBonolotoResults,
} from "./controllers/bonoloto";

dotenv.config();
export const app: Application = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const port = process.env.PORT || 8000;
export const server = app.listen(port);

const debugLogger = debug("node-app");

let connections: net.Socket[] = [];

server.on("connection", (connection) => {
  // register connections
  connections.push(connection);

  // remove/filter closed connections
  connection.on("close", () => {
    connections = connections.filter(
      (currentConnection) => currentConnection !== connection
    );
  });
});

server.on("connection", (connection) => {
  // register connections
  connections.push(connection);

  // remove/filter closed connections
  connection.on("close", () => {
    connections = connections.filter(
      (currentConnection) => currentConnection !== connection
    );
  });
});

server.on("listening", () => {
  console.log(`Server is listening on port ${port}`);
});

function shutdown() {
  console.log("Received kill signal, shutting down gracefully");

  server.close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 20000);

  // end current connections
  connections.forEach((connection) => connection.end());

  // then destroy connections
  setTimeout(() => {
    connections.forEach((connection) => connection.destroy());
  }, 10000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function main() {
  app.use(bodyParser.json());

  app.get("/health", async (req, res) => {
    try {
      // Return success response
      res.status(RESPONSE_CODE_OK).json({
        message: "Application is healthy",
        database: "connected",
      });

      debugLogger("Health check succeeded");
    } catch (error) {
      // Return error response
      res.status(RESPONSE_CODE_SERVER_ERROR).json({
        message: "Application is unhealthy",
        database: "disconnected",
      });

      debugLogger("Health check failed: %O", error);
    }
  });

  app.post("/bonoloto", getBonolotoResults);
  app.get("/bonoloto", getLastBonolotoResults);
}

main().catch((error) => {
  console.error(error);
});
