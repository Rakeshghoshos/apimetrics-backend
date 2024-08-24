import { Server } from "socket.io";

let io;
export const initSocket = (server) => {
  io = new Server(server);
};

export default io;
