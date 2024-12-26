import { AccessoryTypes } from "node-tradfri-client";
import { lightbulbs, lightDevices, plugs, plugDevices } from "./devices.js";
import { io } from "../services/conectServices.js";
import { getUserDevices } from "../tradfri/devices.js";
import { connectedUsers } from "../index.js";

export function tradfri_deviceRemoved(instanceId) {
  if (lightbulbs[instanceId]) {
    delete lightbulbs[instanceId];
    console.log(`Bombilla eliminada: ${instanceId}`);
  } else if (plugs[instanceId]) {
    // Eliminar enchufes también
    delete plugs[instanceId];
    console.log(`Enchufe eliminado: ${instanceId}`);
  }
}

// Función de actualización
export async function tradfri_deviceUpdated(device) {
  // Para bombillas
  console.log("se actualiza el estado de una bombilla");
  if (device.type === AccessoryTypes.lightbulb) {
    lightbulbs[device.instanceId] = device;
/*
    // Notifica al frontend
    const lights = lightDevices();
    const plugs = plugDevices();
    //console.log(lights);
    io.emit("devicesState", {
      lights,
      plugs,
    });
*/

//Metodo nuevo con nombres personalizados
    // Obtiene los dispositivos con los nombres personalizados
    // Obtener los userId de todos los sockets conectados
    for (let [socketId, userId] of connectedUsers) {
      // Encontrar el socket correspondiente
      const socket = io.sockets.sockets.get(socketId);

      if (socket) {
        //Emitir solo al usuario correspondiente
        const { updatedLights, updatedPlugs } = await getUserDevices(userId);
        socket.emit("devicesState", {
          lights: updatedLights,
          plugs: updatedPlugs,
        });
        console.log(`Emitiendo actualización a usuario ${userId} con socket ${socketId}`);
      } else {
        console.log(`Socket ${socketId} no encontrado.`);
      }
    }

    
  }

  // Para enchufes
  if (device.type === AccessoryTypes.plug) {
    plugs[device.instanceId] = device;
    // console.log(`Enchufe actualizado: ${device.instanceId}`, device);  // Verificar que se está agregando correctamente
  }
}
