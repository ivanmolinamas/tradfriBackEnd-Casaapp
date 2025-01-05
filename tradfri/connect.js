import { TradfriClient } from "node-tradfri-client";
import { tradfri_deviceUpdated, tradfri_deviceRemoved } from "./events.js";
import { gatewayIp, securityCode } from "../config/env.js";

const tradfri = new TradfriClient(gatewayIp);
//const lightbulbs = {};  // Puedes agregar otros dispositivos aquí si lo deseas

// Función para conectarse al gateway Tradfri
export async function connectTradfri() {
  try {
    // Autenticar y conectar al gateway
    const { identity, psk } = await tradfri.authenticate(securityCode);
    await tradfri.connect(identity, psk);
    console.log("Conexión exitosa al gateway.");

    tradfri
      .on("device updated", tradfri_deviceUpdated) // suscripción a las actualizaciones de estado
      .on("device removed", tradfri_deviceRemoved) // suscripción a dispositivos borrados
      .observeDevices(); // Obtenemos los dispositivos disponibles
    console.log("Observando dispositivos...");
  } catch (error) {
    console.error("Error al conectar con el gateway:", error);
    setTimeout(connectTradfri, 5000); // Reintentar en 5 segundosconnect
  }
}

export { tradfri }; // Exportar para usar en otros archivos
