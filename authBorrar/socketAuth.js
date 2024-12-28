import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/config.js";

export default function configureSocketAuth(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Falta el token"));

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return next(new Error("Token inválido"));
      socket.user = user;
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(`Usuario conectado: ${socket.user.userId} (${socket.user.rol})`);

    if (socket.user.rol === "admin") {
      socket.emit("adminEvent", { message: "Bienvenido, admin" });
    }

    socket.on("controlDevice", (data) => {
      if (socket.user.rol !== "admin") {
        return socket.emit("error", { message: "No tienes permiso para esta acción" });
      }
      console.log(`Controlando dispositivo: ${data.deviceId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Usuario desconectado: ${socket.user.userId}`);
    });
  });
}
