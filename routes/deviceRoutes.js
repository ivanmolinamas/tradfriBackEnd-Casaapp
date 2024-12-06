import express from "express";
import { getDevices } from "../controllers/deviceController.js";

const router = express.Router();

// Ruta para obtener la lista con dispositivos
router.get("/devices", getDevices);

export default router;