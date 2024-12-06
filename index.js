import express from "express";
import http from "http";
import {Server as SocketServer} from "socket.io";
import cors from "cors";
import { connectTradfri } from "./tradfri/connect.js";  // Asegúrate de importar correctamente
import deviceRoutes from "./routes/deviceRoutes.js";  // Importa las rutas
import lightRoutes from "./routes/lightRoutes.js";
import plugRoutes from "./routes/plugRoutes.js";



const app = express();
const server = http.createServer(app); //servidor http
const io = new SocketServer(server, { //servidor webscoket
  cors: {
  origin: "http://localhost:5173",  // Permite todas las solicitudes
  methods: ["GET", "POST"]  // Métodos permitidos
  }
});

app.use(cors());
app.use(express.json());  // Para que el cuerpo de las solicitudes esté en formato JSON

// Rutas
app.use("/api", deviceRoutes);  // Usa el prefijo '/api' para las rutas de dispositivos
app.use("/light", lightRoutes);  // Usa el prefijo '/light' para las rutas de bombillas
app.use("/plug", plugRoutes);  // Usa el prefijo '/plug' para las rutas de enchufes

// Evento cuando un cliente se conecta
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");
  
  // Enviar estado de los dispositivos al cliente
  /*
  socket.emit("devicesState", {
    lightbulbs,
    plugs
  });
*/
  // Eventualmente puedes emitir un evento cuando un dispositivo cambia de estado
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });


});


// Conectar con el Gateway de IKEA
connectTradfri();

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});


server.listen(4000, () => {
  console.log("Servidor WebSocket en ejecución en el puerto 4000");
});








/*
Explicación del código
Configuración del servidor: Usamos Express para crear un servidor que escuche en un puerto específico.
Conexión al gateway: La función connectTradfri() establece la conexión y observa los dispositivos.
Rutas de la API:
GET /api/devices: Devuelve la lista de dispositivos disponibles en el tradfri.
GET /light/:id/state: Devuelve el estado de la bombilla especificada por su ID.
POST /light/:id/toggle: Alterna el estado de la bombilla especificada por su ID.
POST /plug/:id/toggle: Alterna el estado del enchufe especificado por su ID.
GET /plug/:id/state: Devuelve el estado del enchufe especificado por su ID.
Iniciar el servidor: El servidor comienza a escuchar en el puerto definido.
Cómo usar la API
Para verificar el estado de una bombilla:

Realiza una solicitud GET a http://localhost:3000/light/65551/state (reemplaza 65551 con el ID de tu bombilla).
Para alternar el estado de una bombilla:

Realiza una solicitud POST a http://localhost:3000/light/65537/toggle
Notas
Asegúrate de que el servidor esté en ejecución antes de hacer las solicitudes.
Puedes usar herramientas como Postman o cURL para probar las rutas de la API.

*/
/*
Lista bombillas en casa
Bombilla ID: 65537 = Oficina
Bombilla ID: 65550 = Lampara Cristina
Bombilla ID: 65551 = Lampara Ivan 
Bombilla ID: 65562 = Mesa 1
Bombilla ID: 65564 = Mesa 2
Bombilla ID: 65565 = Pasillo
Enchufe ID: 65546 = Luz del sofa
*/