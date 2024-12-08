import { AccessoryTypes } from "node-tradfri-client";
import { lightbulbs, lightDevices, plugs , plugDevices } from "./devices.js";
import { io  } from "../services/conectServices.js";


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
export function tradfri_deviceUpdated(device) {
  // Para bombillas
  console.log("se actualiza el estado de una bombilla")
  if (device.type === AccessoryTypes.lightbulb) {
    lightbulbs[device.instanceId] = device;
    //console.log(`Bombilla actualizada: ${device.instanceId}`, device);  // Verificar que se está agregando correctamente
    //console.log(device)

    // Notifica al frontend
    const lights = lightDevices();
    const plugs = plugDevices();
    //console.log(lights);
    io.emit("devicesState", {
      lights,
      plugs,
    });
    /**
     *  {
      id: device.instanceId,
      name: device.name,
      type: "lightbulb",
      state: device.lightList[0]?.onOff,
      brightness: device.lightList[0]?.dimmer,
    }
     */
  }

  // Para enchufes
  if (device.type === AccessoryTypes.plug) {
    plugs[device.instanceId] = device;
    // console.log(`Enchufe actualizado: ${device.instanceId}`, device);  // Verificar que se está agregando correctamente
  }
}
