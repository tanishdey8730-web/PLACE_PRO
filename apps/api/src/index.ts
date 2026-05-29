import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { setupSocket } from "./socket/index.js";

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true },
});

setupSocket(io);
app.set("io", io);

server.listen(PORT, () => {
  console.log(`PlacePro API running on http://localhost:${PORT}`);
});
