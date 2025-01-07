import { conectar as connectDB } from "../services/db.js";
import mariadb from "mariadb";
import { lightDevices } from "../tradfri/devices.js";

/*
// Obtener la lista de los dispositivos personales por el ID del usuario
async function getPersonalDevices(data, callback) {
  console.log("Obtener dispositivos");
  // iniciamos la conexion
  const conexion = await connectDB();
  //console.log("data:", data);
  const userId = data.id; // ID del usuario autenticado
  //console.log("userId:", userId);
  try {
    const dispositivos = await conexion.query(
      `
      SELECT d.ID_device, d.name_device, ud.custom_name, ud.widget_type
      FROM dispositivos d
      LEFT JOIN usuario_dispositivos ud ON d.ID_device = ud.device_id AND ud.user_id = ?
    `,
      [userId]
    );
    //console.log("dispositivos:", dispositivos);
    callback({ status: "success", devices: dispositivos });
  } catch (error) {
    console.error("Error al obtener dispositivos:", error);
    callback({ status: "error", error: "Error al obtener dispositivos." });
  }
}*/

// Actualiza con cambios como nuevo nombre y tipo de widget el dispositivo personal según el ID del usuario y el del dispositivo
async function setNamePersonalDevice(data, callback) {
  console.log("Actualizar dispositivo");
  //console.log("data:", data);
  //Obtenemos los datos del cuerpo de la petición
  const { deviceId, customName, widgetType } = data.body;
  const userId = data.id; // ID del usuario autenticado

  // Validar si widgetType es uno de los valores permitidos, si no, asignar NULL
  const validWidgetTypes = ["slider", "switch", "text", "chart"];
  const widgetTypeToInsert = validWidgetTypes.includes(widgetType)
    ? widgetType
    : null;
  //console.log("widgetTypeToInsert:", widgetTypeToInsert);
  try {
    const conexion = await connectDB(); // Iniciamos la conexión a BD

    // Verifica si el usuario ya tiene este dispositivo
    const [rows] = await conexion.query(
      `
      SELECT * FROM usuario_dispositivos
      WHERE user_id = ? AND device_id = ?
    `,
      [userId, deviceId]
    );

    // Comprobamos si el dispositivo existe para este usuario
    //console.log("existingDevice:", rows);
    if (!rows || rows.length === 0) {
      console.log("El dispositivo NO existe para este usuario");
      // Si el dispositivo NO existe para este usuario, inserta uno nuevo
      await conexion.query(
        `
         INSERT INTO usuario_dispositivos (user_id, device_id, custom_name, widget_type)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE custom_name = VALUES(custom_name), widget_type = VALUES(widget_type)
  `,
        [userId, deviceId, customName, widgetTypeToInsert]
      );

      callback({
        status: "success",
        message: "Dispositivo actualizado correctamente.",
      });
    } else {
      console.log("El dispositivo existe para este usuario");
      // Si existe, realiza actualiza valores
      await conexion.query(
        `
        UPDATE usuario_dispositivos
        SET custom_name = ?, widget_type = ?
        WHERE user_id = ? AND device_id = ?
        `,
        [customName, widgetTypeToInsert, userId, deviceId]
      );
      callback({
        status: "success",
        message: "Dispositivo insertado correctamente.",
      });
    }
    console.log("Dispositivo actualizado correctamente.");
  } catch (error) {
    console.log("Error al actualizar el dispositivo:", error);
    callback({
      status: "error",
      error: "Error al actualizar el dispositivo.",
      error,
    });
  }
}

// Testeo
// Obtener la lista de los dispositivos personales por el ID del usuario
async function getPersonalDevices(data, callback) {
  console.log("Obtener dispositivos");
  // Iniciamos la conexión
  const conexion = await connectDB();
  const userId = data.id; // ID del usuario autenticado

  try {
    // Obtenemos los dispositivos del usuario
    const dispositivos = await conexion.query(
      `
      SELECT d.ID_device, d.name_device, ud.custom_name, ud.widget_type
      FROM dispositivos d
      LEFT JOIN usuario_dispositivos ud ON d.ID_device = ud.device_id AND ud.user_id = ?
      `,
      [userId]
    );

    // Obtenemos la lista de bombillas con sus propiedades
    const lights = lightDevices(); // Supongamos que lightDevices() retorna un array de dispositivos con 'id' y 'isDimmable'

    // Creamos un mapa para acceder a isDimmable por ID de forma eficiente
    const lightDimmableMap = lights.reduce((acc, light) => {
      acc[light.id] = light.isDimmable; // Mapeamos el ID al valor de isDimmable
      return acc;
    }, {});
    
    // Añadimos la propiedad isDimmable a cada dispositivo si está en la lista de bombillas
    const dispositivosActualizados = dispositivos.map((dispositivo) => {
      return {
        ...dispositivo,
        isDimmable: lightDimmableMap[dispositivo.ID_device] || false, // Si no está en el mapa, asumimos false
      };
    });
    console.log("dispositivosActualizados:", dispositivosActualizados);
    callback({ status: "success", devices: dispositivosActualizados });
  } catch (error) {
    console.error("Error al obtener dispositivos:", error);
    callback({ status: "error", error: "Error al obtener dispositivos." });
  }
}


// Exportar funciones
export { getPersonalDevices, setNamePersonalDevice };


/**
 * `
        INSERT INTO usuario_dispositivos (user_id, device_id, custom_name, widget_type)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE custom_name = VALUES(custom_name), widget_type = VALUES(widget_type)
 */