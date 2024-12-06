import { TradfriClient } from "node-tradfri-client";
import { tradfri_deviceUpdated, tradfri_deviceRemoved } from "./events.js";
import { gatewayIp, securityCode } from "../config/env.js";

const tradfri = new TradfriClient(gatewayIp);
const lightbulbs = {};

export async function connectTradfri() {
  const { identity, psk } = await tradfri.authenticate(securityCode);
  await tradfri.connect(identity, psk);
  console.log("Conexión exitosa al gateway.");

  tradfri
    .on("device updated", tradfri_deviceUpdated)
    .on("device removed", tradfri_deviceRemoved)
    .observeDevices();
}

export { tradfri, lightbulbs };