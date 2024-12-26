// Lista de dispositivos organizados por tipo
export const lightbulbs = {}; //Estructura de bombillas
export const plugs = {}; // Estructura para enchufes

// Crear y exportar un array de bombillas con información estructurada y ordenada por ID
export const lightDevices = () => {
  return Object.values(lightbulbs)
    .map((device) => {
      const light = device.lightList[0]; // Acceder al primer elemento de la lista de luces
      return {
        id: device.instanceId,
        name: device.name || "noName", // noName si no tiene nombre
        type: device.type, // tipo
        onOff: light.onOff, // estado actual del la bombilla
        brightness: light.dimmer, // nivel de brillo
        alive: device.alive, // comprobamos que esta disponible
        dimable: light.isDimmable, // comprobamos si es dimmable
        colorTemperature: light.colorTemperature, // obtenemos la temperatura de color
        spectrum: light.spectrum, // obtenemos el tipo de luz
      };
    })
    .sort((a, b) => a.id - b.id); // Ordenar por ID
};

// Crear y exportar un array de enchufes con información estructurada y ordenada por ID
export const plugDevices = () => {
  return Object.values(plugs)
    .map((device) => {
      return {
        id: device.instanceId,
        name: device.name || "noName", // noName si no tiene nombre
        type: device.type, // tipo
        onOff: device.plugList[0]?.onOff || false, // Verificar que tenga plugList y obtener onOff
        alive: device.alive, // comprobamos que esta disponible
      };
    })
    .sort((a, b) => a.id - b.id); // Ordenar por ID
};

import { conectar as connectDB } from "../services/db.js";

export async function getUserDevices(userId) {
  const conexion = await connectDB();

  console.log("Obtener dispositivos del usuario:", userId);
  // Obtenemos las listas de dispositivos
  const lights = lightDevices();
  const plugs = plugDevices();

  // Realizamos una consulta a la base de datos para obtener nombres personalizados y tipo de widget
  const results = await conexion.query(
    `SELECT device_id, custom_name, widget_type
     FROM usuario_dispositivos
     WHERE user_id = ?`,
    [userId]
  );
 //console.log("results:", results);
  // Mapeamos los resultados de la base de datos en un objeto para fácil acceso
  const customNames = results.reduce((acc, row) => {
    const { device_id, custom_name, widget_type } = row;
    acc[device_id] = { custom_name, widget_type };
    return acc;
  }, {});

  // Actualizamos nombres en las bombillas
  const updatedLights = lights.map((device) => {
    const customData = customNames[device.id];
    return {
      ...device,
      name: customData?.custom_name || device.name, // Si hay un nombre personalizado, lo usamos
      widgetType: customData?.widget_type || null, // Incluimos el widget_type si está definido
    };
  });

  // Actualizamos nombres en los enchufes
  const updatedPlugs = plugs.map((device) => {
    const customData = customNames[device.id];
    return {
      ...device,
      name: customData?.custom_name || device.name, // Si hay un nombre personalizado, lo usamos
      widgetType: customData?.widget_type || null, // Incluimos el widget_type si está definido
    };
  });
 // console.log("updatedLights:", updatedLights);

  // Retornamos los dispositivos con los nombres y widgets actualizados
  return { updatedLights, updatedPlugs };
}
