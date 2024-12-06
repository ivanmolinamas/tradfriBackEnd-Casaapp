import { AccessoryTypes } from "node-tradfri-client";
import { lightbulbs, plugs } from "./devices.js";


export function tradfri_deviceRemoved(instanceId) {
  if (lightbulbs[instanceId]) {
    delete lightbulbs[instanceId];
    console.log(`Bombilla eliminada: ${instanceId}`);
  } else if (plugs[instanceId]) {  // Eliminar enchufes también
    delete plugs[instanceId];
    console.log(`Enchufe eliminado: ${instanceId}`);
  }
}

export function tradfri_deviceUpdated(device) {
  // Para bombillas
  if (device.type === AccessoryTypes.lightbulb) {
    lightbulbs[device.instanceId] = device;
    //console.log(`Bombilla actualizada: ${device.instanceId}`, device);  // Verificar que se está agregando correctamente
  }

  // Para enchufes
  if (device.type === AccessoryTypes.plug) {
    plugs[device.instanceId] = device;
   // console.log(`Enchufe actualizado: ${device.instanceId}`, device);  // Verificar que se está agregando correctamente
  }
}