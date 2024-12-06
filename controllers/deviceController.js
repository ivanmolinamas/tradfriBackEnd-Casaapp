import { lightbulbs, plugs } from "../tradfri/devices.js";  // Aquí puedes acceder a los dispositivos


export function getDevices(req, res) {
  const allDevices = [];
  
// Si hay bombillas
if (Object.keys(lightbulbs).length > 0) {
  const lightbulbDevices = Object.values(lightbulbs).map(device => ({
    id: device.instanceId,  // ID del dispositivo
    name: device.name,  // Nombre del dispositivo
    status: device.state,  // Estado del dispositivo
    available: device.alive  // Disponibilidad (alive)
  }));
  allDevices.push({
    type: "lightbulbs",
    devices: lightbulbDevices
  });
}

// Si hay enchufes
if (Object.keys(plugs).length > 0) {
  const plugDevices = Object.values(plugs).map(device => ({
    id: device.instanceId,  // ID del dispositivo
    name: device.name,  // Nombre del dispositivo
    status: device.state,  // Estado del dispositivo
    available: device.alive  // Disponibilidad (alive)
  }));
  allDevices.push({
    type: "plugList",
    devices: plugDevices
  });
}

// Si encontramos dispositivos, los devolvemos
if (allDevices.length > 0) {
  return res.status(200).json(allDevices);  // Devolver los dispositivos filtrados
} else {
  return res.status(404).json({ message: "No devices found." });  // Si no hay dispositivos, devolver mensaje de error
}
}