import { TradfriClient } from "node-tradfri-client";
import { tradfri_deviceUpdated, tradfri_deviceRemoved } from "./events.js";
import { gatewayIp, securityCode } from "../config/env.js";

const tradfri = new TradfriClient(gatewayIp);
//const lightbulbs = {};  // Puedes agregar otros dispositivos aquí si lo deseas

export async function connectTradfri() {
  try {
    const { identity, psk } = await tradfri.authenticate(securityCode);
    await tradfri.connect(identity, psk);
    console.log("Conexión exitosa al gateway.");

    tradfri
      .on("device updated", tradfri_deviceUpdated) // suscripcion a las actualizaciones de estado
      .on("device removed", tradfri_deviceRemoved) // suscricpcion a dispositivos borrados
      .observeDevices();
      console.log("Observando dispositivos...");
  } catch (error) {
    console.error("Error al conectar con el gateway:", error);
  }
}

export { tradfri }; // Exportar para usar en otros archivos

