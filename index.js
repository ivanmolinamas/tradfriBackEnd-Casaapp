import express from "express";
import { corsConfig } from "./config/cors.js";
import { connectTradfri } from "./tradfri/connect.js";
import lightRoutes from "./routes/lightRoutes.js";

const app = express();
const port = 3000;

// Usar CORS
app.use(corsConfig);

// Usar rutas para las bombillas
app.use("/light", lightRoutes);

// Conectar al gateway Tradfri
connectTradfri().catch((err) => console.error("Error conectando al gateway:", err));

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});