import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";

//se crean las conexiones y se exportan para usarlas donde sea necesario
const app = express(); //servidor express
const server = http.createServer(app); //servidor http
const io = new SocketServer(server, { 
  //servidor webscoket
  cors: {
    origin: "http://localhost:5173", // Permite todas las solicitudes
    methods: ["GET", "POST"], // Métodos permitidos
  },
});

app.use(cors()); // usamos cors para evitar problemas
app.use(express.json()); // Para que el cuerpo de las solicitudes esté en formato JSON


export { app , io , server }; // Exportamos las conexiones
