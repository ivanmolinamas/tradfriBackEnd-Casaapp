import { TradfriClient } from "node-tradfri-client";
import { tradfri_deviceUpdated, tradfri_deviceRemoved } from "./events.js";
import { gatewayIp, securityCode } from "../config/env.js";

const tradfri = new TradfriClient(gatewayIp);
const MAX_RETRIES = 5; // Número máximo de reintentos
//const retryCount = 0;

// Función para conectarse al gateway Tradfri
export async function connectTradfri(retryCount = 0) {
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
    
    // Intentar hacer ping al gateway antes de reconectar
    try {
      const pingSuccess = await tradfri.ping();
      if (!pingSuccess) {
        console.error("Gateway no responde al ping.");
        // Si el ping falla después de varios intentos, reiniciar la conexión
        if (retryCount >= MAX_RETRIES) {
          console.log("Se alcanzó el límite de intentos, restableciendo la conexión...");
          await resetConnection(); // Restablecemos la conexión
        }
      }
    } catch (pingError) {
      console.error("Error al hacer ping al gateway:", pingError);
    }

    // Si no hemos alcanzado el límite de reintentos, reintentamos la conexión
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Reintentando la conexión en 5 segundos... (Intento ${retryCount + 1}/${MAX_RETRIES})`);
      setTimeout(() => connectTradfri(retryCount + 1), 5000);
    } else {
      console.error("Se alcanzó el número máximo de reintentos. No se puede conectar al gateway.");
    }
  }
}

// Reiniciar la conexión si es necesario
export async function resetConnection() {
  console.log("Restableciendo la conexión...");
  await tradfri.reset(); // Resetea la conexión
  connectTradfri(); // Intentamos conectar de nuevo
}


export { tradfri }; // Exportar para usar en otros archivos
