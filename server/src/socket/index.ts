import { Server } from "socket.io";


let io: Server;


export function initializeSocket(
  socketServer: Server
) {

  io = socketServer;

}


export function getSocket() {

  if (!io) {

    throw new Error(
      "Socket.IO has not been initialized"
    );

  }


  return io;

}