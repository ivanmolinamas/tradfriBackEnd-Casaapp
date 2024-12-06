import express from "express";
import { lightbulbs } from "../tradfri/devices.js";  // Aquí puedes acceder a los dispositivos



const router = express.Router();

// Estado de una bombilla
router.get("/:id/state", (req, res) => {
  const bulbId = req.params.id;
  const light = lightbulbs[bulbId] && lightbulbs[bulbId].lightList[0];
  if (light) {
    console.log(`Estado de la bombilla ${bulbId}:`, light.onOff); // Depuración
    res.json({ state: light.onOff ? "true" : "false" });
  } else {
    res.status(404).json({ error: "Bombilla no encontrada" });
  }
});

// Alternar bombilla
router.post("/:id/toggle", (req, res) => {
  const bulbId = req.params.id;
  const light = lightbulbs[bulbId] && lightbulbs[bulbId].lightList[0];
  if (light) {
    light.toggle();
    res.json({ message: `Bombilla ${bulbId} alternada.` });
  } else {
    res.status(404).json({ error: "Bombilla no encontrada" });
  }
});

// Encender bombilla
router.post("/:id/turnon", (req, res) => {
  const bulbId = req.params.id;
  const light = lightbulbs[bulbId] && lightbulbs[bulbId].lightList[0];
  if (light) {
    light.turnOn();
    res.json({ message: `Bombilla ${bulbId} encendida.` });
  } else {
    res.status(404).json({ error: "Bombilla no encontrada" });
  }
});

// Apagar bombilla
router.post("/:id/turnoff", (req, res) => {
  const bulbId = req.params.id;
  const light = lightbulbs[bulbId] && lightbulbs[bulbId].lightList[0];
  if (light) {
    light.turnOff();
    res.json({ message: `Bombilla ${bulbId} apagada.` });
  } else {
    res.status(404).json({ error: "Bombilla no encontrada" });
  }
});

// Ajustar brillo
router.post("/:id/dimmer/:brightness", (req, res) => {
  const bulbId = req.params.id;
  const brightness = parseInt(req.params.brightness, 10);

  if (isNaN(brightness) || brightness < 0 || brightness > 100) {
    return res.status(400).json({
      error: "El valor del brillo debe estar entre 0 y 100.",
    });
  }

  const light = lightbulbs[bulbId] && lightbulbs[bulbId].lightList[0];

  if (light) {
    light.setBrightness(brightness);
    res.json({
      message: `Bombilla ${bulbId} ajustada a ${brightness}% de brillo.`,
    });
  } else {
    res.status(404).json({ error: "Bombilla no encontrada" });
  }
});

// Estado del dimmer
router.get("/:id/statusdimmer", (req, res) => {
  const bulbId = req.params.id;
  const light = lightbulbs[bulbId] && lightbulbs[bulbId].lightList[0];
  if (light) {
    res.json({ dimmer: light.dimmer });
  } else {
    res.status(404).json({ error: "Bombilla no encontrada" });
  }
});

// Lista de dispositivos
router.get("/list", (req, res) => {
  try {
    const devices = Object.values(lightbulbs).map((device) => {
      const light = device.lightList[0];
      return {
        id: device.instanceId,
        name: device.name,
        type: device.type,
        onOff: light.onOff,
        brightness: light.dimmer,
        alive: device.alive,
      };
    });
    res.json(devices);
  } catch (error) {
    console.error("Error al obtener la lista de dispositivos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
