import { lightbulbs, plugs } from "../tradfri/devices.js";

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

// función con callback para hacer un toggle(cambio de estado) a una bombilla
export async function toggleLight2(data, callback) {
  // Obtenemos el ID del dispositivo
  const id = data.id;
  try {
    if (lightbulbs[id]) {
      //comprobamos que la bombilla existe
      const device = lightbulbs[id]; //obtenemos el dispositivo
      const light = device.lightList[0]; //obtenemos la bombilla
      light //cambiamos el estado de la bombilla
        .toggle()
        .then((result) => {
          //obtenemos el resultado
          if (result) {
            //resultado positivo
            //console.log(result)
            callback({
              status: "success",
              message: "Luz actualizada correctamente",
            }); //devolvemos callback
            console.log(`Bombilla ${id} cambiado su estado`);
          } else {
            // resultado negativo
            callback({
              status: "error",
              message: "No se pudo cambiar el estado.",
            }); //devolvemos callback
            console.log("No se pudo cambiar el estado");
          }
        })
        .catch((error) => {
          callback({ status: "error", message: error.message });
          console.log("Error al cambiar el estado:", error);
        });
      // comprobamos si es un enchufe
    } else if (plugs[id]) {
      console.log("Los enchufes no pueden ser controlados");
      // De momento, los enchufes no pueden ser controlados
      /*
      const device = plugs[id]; //obtenemos el dispositivo
      const plug = device; //obtenemos el enchufe
      plug //cambiamos el estado de la bombilla
        //.toggle()
        .on()
        .then((result) => {
          //obtenemos el resultado
          if (result) {
            //resultado positivo
            //console.log(result)
            callback({
              status: "success",
              message: "Enchufe actualizado correctamente",
            }); //devolvemos callback
            console.log(`Bombilla ${id} cambiado su estado`);
          } else {
            // resultado negativo
            callback({
              status: "error",
              message: "No se pudo cambiar el estado.",
            }); //devolvemos callback
            console.log("No se pudo cambiar el estado");
          }
        })
        .catch((error) => {
          callback({ status: "error", message: error.message });
          console.log("Error al cambiar el estado:", error);
        });*/
    } else {
      callback({ status: "error", message: "Dispositivo no encontrado" });
      throw new Error("Dispositivo no encontrado");
    }
  } catch (error) {
    console.error(error.message);
    callback({ status: "error", message: error.message });
  }
}

// Dimmer de una bombilla
export async function setDimmerLight(data, callback) {
  const id = data.id;
  const brightnessIN = data.brightness;

  // Comprobar si es una bombilla
  if (!lightbulbs[id]) {
    console.log("Dispositivo no encontrado.");
    callback({
      status: "error",
      message: "Dispositivo no encontrado.",
    });
  }
  // Comprobamos el valor del brillo que se quiere poner
  const brightness = parseInt(brightnessIN, 10);
  //light.brightness();  // Cambiar el estado de la bombilla
  if (isNaN(brightness) || brightness < 0 || brightness > 100) {
    console.log("El valor del brillo debe estar entre 0 y 100.");
    callback({
      status: "error",
      message: "El valor del brillo debe estar entre 0 y 100.",
    });
  }

  const light = lightbulbs[id] && lightbulbs[id].lightList[0];
  //comprobamos que la bombilla es dimmable ;
  if (!light.isDimmable) {
    console.log("La bombilla no soporta regulación de brillo.");
    callback({
      status: "error",
      message: "La bombilla no soporta regulación de brillo.",
    });
  }

  //Ajustamos el brillo
  // Ajustar el brillo
  try {
    light
      .setBrightness(brightness, 0)
      .then((result) => {
        if (result) {
          console.log(`Bombilla ${id} ajustada a ${brightness}% de brillo.`);
          callback({
            status: "success",
            message: `Luz actualizada correctamente al ${brightness}%.`,
          });
        } else {
          console.log("No se pudo ajustar el brillo.");
          callback({
            status: "error",
            message: "No se pudo ajustar el brillo.",
          });
        }
      })
      .catch((error) => {
        console.log("Error al cambiar el estado:", error);
      });
  } catch (error) {
    console.error(error.message);
    callback({ status: "error", message: error.message });
  }
}

//cambia la temperatura de color de una bombilla
export async function setTemperature(data, callback) {
  const id = data.id;
  const temperature = data.temperature;
  console.log(id, temperature);
  if (!lightbulbs[id]) {
    console.log("Dispositivo no encontrado.");
    callback({
      status: "error",
      message: "Dispositivo no encontrado.",
    });
  }
  // Comprobar si es una bombilla
  const device = lightbulbs[id];
  const light = device.lightList[0]; // Asumiendo que solo hay un dispositivo de luz por bombilla
  if (light.spectrum === "white") {
    //comprobamos que la bombilla se pueda gestionar en temperatura de color.
    light
      .setColorTemperature(temperature, 0) // Cambiar el estado de la bombilla
      .then((result) => {
        if (result) {
          console.log("Cambio de color de bombilla");
          callback({
            status: "success",
            message: "Luz cambiada de color correctamente",
          });
        } else {
          console.log("No se pudo cambiar el color.");
          callback({
            status: "error",
            message: "No se pudo cambiar el color.",
          });
        }
      })
      .catch((error) => {
        console.log("Error al cambiar el color:", error);
      });
  } else {
    callback({
      status: "error",
      message: "La bombilla no soporta cambio de color",
    });
  }
}
