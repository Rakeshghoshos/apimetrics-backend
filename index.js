import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import router from "./src/index.js";
import dbConnect from "./core/db.js";
import http from "http";
import { initSocket } from "./core/socket.js";
configDotenv({ path: "./.env" });

const app = express();

const allowedOrigins = [
  'https://apimetrics-frontend.vercel.app',
];

app.use(cors({
 origin: (origin, callback) => {
    // if (allowedOrigins.includes(origin) || !origin) {
    //   // Allow requests with no origin (like mobile apps or curl requests)
    //   callback(null, true);
    // } else {
    //   callback(new Error('Not allowed by CORS'));
    // }
   callback(null, true);
  },
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
