import { lightbulbs } from "../tradfri/devices.js";

export function toggleLight(id) {
  if (lightbulbs[id]) {
    // Comprobar si es una bombilla
    const device = lightbulbs[id];
    const light = device.lightList[0]; // Asumiendo que solo hay un dispositivo de luz por bombilla
    light.toggle(); // Cambiar el estado de la bombilla

    // Aquí podrías agregar lógica para hacer que el dispositivo realmente se encienda o apague
    //device.update();  // Este es un método genérico de actualización del dispositivo (si está disponible)
    //console.log(`Bombilla ${id} ${onOff ? 'encendida' : 'apagada'}`);
  } else {
    console.log("Dispositivo no encontrado.");
  }
}

export function dimmerLight(id, brightnessIN) {
  if (lightbulbs[id]) {
    // Comprobar si es una bombilla
    const brightness = parseInt(brightnessIN, 0);
    //light.brightness();  // Cambiar el estado de la bombilla
    if (isNaN(brightness) || brightness < 0 || brightness > 100) {
      console.log("El valor del brillo debe estar entre 0 y 100.");
    } else {
      const light = lightbulbs[id]; // Accede directamente a la luz

      if (light.isDimmable) {
        light
          .setBrightness(brightness)
          .then((result) => {
            if (result) {
              console.log(
                `Bombilla ${id} ajustada a ${brightness}% de brillo.`
              );
            } else {
              console.log("No se pudo ajustar el brillo.");
            }
          })
          .catch((error) => {
            console.log("Error al ajustar el brillo:", error);
          });
      } else {
        console.log("La bombilla no soporta regulación de brillo.");
      }
    }
  } else {
    console.log("Dispositivo no encontrado.");
  }
}
