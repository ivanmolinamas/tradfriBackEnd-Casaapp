import { lightbulbs } from "../tradfri/devices.js";

export function toggleLight(id) {
  if (lightbulbs[id]) {
    // Comprobar si es una bombilla
    const device = lightbulbs[id];
    const light = device.lightList[0]; // Asumiendo que solo hay un dispositivo de luz por bombilla
    light.toggle(); // Cambiar el estado de la bombilla

    //device.update();  // Este es un método genérico de actualización del dispositivo (si está disponible)
    //console.log(`Bombilla ${id} ${onOff ? 'encendida' : 'apagada'}`);
  } else {
    console.log("Dispositivo no encontrado.");
  }
}

export function setDimmerLight(id, brightnessIN) {
  if (lightbulbs[id]) {
    // Comprobar si es una bombilla
    const brightness = parseInt(brightnessIN, 0);
    //light.brightness();  // Cambiar el estado de la bombilla
    if (isNaN(brightness) || brightness < 0 || brightness > 100) {
      console.log("El valor del brillo debe estar entre 0 y 100.");
    } else {
      const light = lightbulbs[id] && lightbulbs[id].lightList[0];
      //console.log("Bombilla encontrada:", light);
      if (light.isDimmable) {
        light
          .setBrightness(brightness,0) // ajustamos el brillo dado
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

//cambia la temperatura de color de una bombilla
export function setTemperature(id, temperature) {
    console.log(id, temperature)
  if (lightbulbs[id]) {
    // Comprobar si es una bombilla
    const device = lightbulbs[id];
    const light = device.lightList[0]; // Asumiendo que solo hay un dispositivo de luz por bombilla
    if(light.spectrum === "white"){ //comprobamos que la bombilla se pueda gestionar en temperatura de color.
        light.setColorTemperature(temperature,0); // Cambiar el estado de la bombilla
    }

    //device.update();  // Este es un método genérico de actualización del dispositivo (si está disponible)
    //console.log(`Bombilla ${id} ${onOff ? 'encendida' : 'apagada'}`);
  } else {
    console.log("Dispositivo no encontrado.");
  }
}
