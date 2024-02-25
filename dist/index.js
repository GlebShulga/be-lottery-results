"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
var cors = require("cors");
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const debug_1 = __importDefault(require("debug"));
const responseCodes_1 = require("./constants/responseCodes");
const bonoloto_1 = require("./controllers/bonoloto");
dotenv.config();
exports.app = (0, express_1.default)();
exports.app.disable("x-powered-by");
exports.app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
const port = process.env.PORT || 8000;
exports.server = exports.app.listen(port);
const debugLogger = (0, debug_1.default)("node-app");
let connections = [];
exports.server.on("connection", (connection) => {
    // register connections
    connections.push(connection);
    // remove/filter closed connections
    connection.on("close", () => {
        connections = connections.filter((currentConnection) => currentConnection !== connection);
    });
});
exports.server.on("connection", (connection) => {
    // register connections
    connections.push(connection);
    // remove/filter closed connections
    connection.on("close", () => {
        connections = connections.filter((currentConnection) => currentConnection !== connection);
    });
});
exports.server.on("listening", () => {
    console.log(`Server is listening on port ${port}`);
});
function shutdown() {
    console.log("Received kill signal, shutting down gracefully");
    exports.server.close(() => {
        console.log("Closed out remaining connections");
        process.exit(0);
    });
    setTimeout(() => {
        console.error("Could not close connections in time, forcefully shutting down");
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
    exports.app.use(body_parser_1.default.json());
    exports.app.get("/health", async (req, res) => {
        try {
            // Return success response
            res.status(responseCodes_1.RESPONSE_CODE_OK).json({
                message: "Application is healthy",
                database: "connected",
            });
            debugLogger("Health check succeeded");
        }
        catch (error) {
            // Return error response
            res.status(responseCodes_1.RESPONSE_CODE_SERVER_ERROR).json({
                message: "Application is unhealthy",
                database: "disconnected",
            });
            debugLogger("Health check failed: %O", error);
        }
    });
    exports.app.post("/bonoloto", bonoloto_1.getBonolotoReults);
}
main().catch((error) => {
    console.error(error);
});
