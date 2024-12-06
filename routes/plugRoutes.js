import express from "express";
import { plugs } from "../tradfri/devices.js";  // Aquí puedes acceder a los dispositivos



const router = express.Router();

// Estado de una enchufe
router.get("/:id/state", (req, res) => {
  const plugId = req.params.id;
  const plug = plugs[plugId] && plugs[plugId].plugList[0];
  if (plug) {
    console.log(`Estado del Enchufe ${plugId}:`, plug.onOff); // Depuración
    res.json({ state: plug.onOff ? "true" : "false" });
  } else {
    res.status(404).json({ error: "Enchufe no encontrado" });
  }
});

// Alternar enchufe on/off
router.post("/:id/toggle", (req, res) => {
  const bulbId = req.params.id;
  const plug = plugs[bulbId] && plugs[bulbId].plugList[0];
  if (plug) {
    plug.toggle();
    res.json({ message: `Enchufe ${bulbId} alternado.` });
  } else {
    res.status(404).json({ error: "Enchufe no encontrado" });
  }
});

// Encender enchufe
router.post("/:id/turnon", (req, res) => {
  const bulbId = req.params.id;
  const plug = plugs[bulbId] && plugs[bulbId].plugList[0];
  if (plug) {
    plug.turnOn();
    res.json({ message: `Enchufe ${bulbId} encendido.` });
  } else {
    res.status(404).json({ error: "Enchufe no encontrado" });
  }
});

// Apagar enchufe
router.post("/:id/turnoff", (req, res) => {
  const bulbId = req.params.id;
  const plug = plugs[bulbId] && plugs[bulbId].plugList[0];
  if (plug) {
    plug.turnOff();
    res.json({ message: `Enchufe ${bulbId} apagado.` });
  } else {
    res.status(404).json({ error: "Enchufe no encontrado" });
  }
});



// Lista de dispositivos
router.get("/list", (req, res) => {
  try {
    const devices = Object.values(plugs).map((device) => {
      // Asegúrate de que plugList existe y tiene al menos un elemento
      const plug = device.plugList && device.plugList[0];
      
      if (!plug) {
        console.log(`No se encontró el enchufe para el dispositivo ${device.instanceId}`);
        return null;  // Si no hay enchufe, lo omitimos
      }

      return {
        id: device.instanceId,
        name: device.name,
        onOff: plug.onOff,  // Estado del enchufe
        alive: device.alive,
      };
    }).filter(device => device !== null);  // Filtra los dispositivos sin enchufes

    //console.log("Dispositivos encontrados:", devices);  // Log para depurar

    if (devices.length > 0) {
      res.json(devices);  // Responder con la lista de dispositivos
    } else {
      res.status(404).json({ message: "No devices found." });  // Si no hay dispositivos, devolver un error
    }
  } catch (error) {
    console.error("Error al obtener la lista de dispositivos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
