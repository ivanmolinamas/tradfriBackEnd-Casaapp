import express from "express";
import cors from "cors";
import { connectTradfri } from "./tradfri/connect.js";  // Asegúrate de importar correctamente
import deviceRoutes from "./routes/deviceRoutes.js";  // Importa las rutas
import lightRoutes from "./routes/lightRoutes.js";
import plugRoutes from "./routes/plugRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // Para que el cuerpo de las solicitudes esté en formato JSON

// Rutas
app.use("/api", deviceRoutes);  // Usa el prefijo '/api' para las rutas de dispositivos
app.use("/light", lightRoutes);  // Usa el prefijo '/api' para las rutas de dispositivos
app.use("/plug", plugRoutes);  // Usa el prefijo '/api' para las rutas de dispositivos

// Conectar con el Gateway de IKEA
connectTradfri();

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
