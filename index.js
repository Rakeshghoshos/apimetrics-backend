import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import router from "./src/index.js";
import dbConnect from "./core/db.js";
import http from "http";
import { initSocket } from "./core/socket.js";
configDotenv({ path: "./.env" });

const app = express();

app.use(cors({
  origin: 'https://apimetrics-frontend.vercel.app',
  methods: 'GET,POST,PUT,DELETE',
   credentials: true,
}));
const server = http.createServer(app);
initSocket(server);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: false }));

dbConnect();

app.use("/", router);
server.listen(process.env.PORT, () => {
  console.log("server started in port:" + process.env.PORT);
});
