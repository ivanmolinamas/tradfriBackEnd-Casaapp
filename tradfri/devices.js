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
          name: device.name || "noName", // noName si no tiene nombre
          type: device.type, // tipo
          onOff: light.onOff, // estado actual del la bombilla
          brightness: light.dimmer, // nivel de brillo
          alive: device.alive, // comprobamos que esta disponible
          dimable: light.isDimmable,  // comprobamos si es dimeable
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
          alive: device.alive,  // comprobamos que esta disponible
        };
      })
      .sort((a, b) => a.id - b.id); // Ordenar por ID
  };