import { connectToDB } from "./config/db";
import dotenv from 'dotenv';
import http from 'node:http';
import app from "./app";

dotenv.config();

async function startServer() {
    await connectToDB();

    const basePort = Number(process.env.PORT) || 5000;

    const listenOnPort = (port: number) => {
        const server = http.createServer(app);

        server.on('error', (error: NodeJS.ErrnoException) => {
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
