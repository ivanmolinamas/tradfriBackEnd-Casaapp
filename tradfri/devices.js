// Lista de dispositivos organizados por tipo
export const lightbulbs = {}; //Estructura de bombillas
export const plugs = {}; // Agregar una estructura para enchufes


// Crear y exportar un array de bombillas con información estructurada y ordenada por ID
export const lightDevices = () => {
    return Object.values(lightbulbs)
      .map((device) => {
        const light = device.lightList[0]; // Acceder al primer elemento de la lista de luces
        return {
          id: device.instanceId,
          name: device.name || "noName", // Fallback si no tiene nombre
          type: device.type,
          onOff: light.onOff,
          brightness: light.dimmer,
          alive: device.alive,
          dimable: light.isDimmable,
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
          name: device.name || "noName", // Fallback si no tiene nombre
          type: device.type,
          onOff: device.plugList[0]?.onOff || false, // Verificar que tenga plugList y obtener onOff
          alive: device.alive,
        };
      })
      .sort((a, b) => a.id - b.id); // Ordenar por ID
  };