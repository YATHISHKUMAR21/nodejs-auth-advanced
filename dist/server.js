"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const dotenv_1 = __importDefault(require("dotenv"));
const node_http_1 = __importDefault(require("node:http"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
async function startServer() {
    await (0, db_1.connectToDB)();
    const basePort = Number(process.env.PORT) || 5000;
    const listenOnPort = (port) => {
        const server = node_http_1.default.createServer(app_1.default);
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                const nextPort = port + 1;
                console.warn(`Port ${port} is busy, retrying on ${nextPort}`);
                listenOnPort(nextPort);
                return;
            }
            console.error('Error starting the server:', error);
            process.exit(1);
        });
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    };
    listenOnPort(basePort);
}
startServer().catch((error) => {
    console.error('Error starting the server:', error);
    process.exit(1);
});
