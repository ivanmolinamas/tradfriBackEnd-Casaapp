import { AccessoryTypes } from "node-tradfri-client";
import { lightbulbs } from "./connect.js";

export function tradfri_deviceUpdated(device) {
  if (device.type === AccessoryTypes.lightbulb) {
    lightbulbs[device.instanceId] = device;
    console.log(`Bombilla actualizada: ${device.instanceId}`);
  }
}

export function tradfri_deviceRemoved(instanceId) {
  delete lightbulbs[instanceId];
  console.log(`Bombilla eliminada: ${instanceId}`);
}