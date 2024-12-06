import { listDevices } from "../tradfri/devices.js";
import { lightbulbs } from "../tradfri/connect.js"; // Importar lightbulbs desde la conexión

// Controlador para manejar la solicitud de listar dispositivos
export const getDeviceList = (req, res) => {
  try {
    const devices = listDevices(lightbulbs); // Usar la función para obtener dispositivos
    res.json(devices);                      // Enviar la respuesta en formato JSON
  } catch (error) {
    console.error("Error al obtener la lista de dispositivos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
