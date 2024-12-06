// Función para obtener una lista genérica de dispositivos (bombillas, enchufes, etc.)
export const listDevices = (lightbulbs) => {
    return Object.values(lightbulbs).map((device) => {
      const light = device.lightList?.[0]; // Si es una bombilla, tendrá lightList
  
      return {
        id: device.instanceId,        // ID único del dispositivo
        name: device.name,            // Nombre del dispositivo
        type: device.type,            // Tipo del dispositivo
        onOff: light?.onOff || false, // Estado (encendido o apagado)
        brightness: light?.dimmer || 0, // Brillo (si aplica)
        alive: device.alive,          // Si está disponible o no
      };
    });
  };
  