import { conectar as connectDB } from "../services/db.js";
import mariadb from "mariadb";

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
}

// Actualizar dispositivos personales
async function setNamePersonalDevice(data, callback) {
  console.log("Actualizar dispositivo");
  console.log("data:", data);
  const { deviceId, customName, widgetType } = data.body;
  const userId = data.id; // ID del usuario autenticado
  console.log(
    "userId:",
    userId,
    "deviceId:",
    deviceId,
    "customName:",
    customName,
    "widgetType:",
    widgetType
  );
 // Validar si widgetType es uno de los valores permitidos, si no, asignar NULL
 const validWidgetTypes = ['slider', 'switch', 'text', 'chart'];
 const widgetTypeToInsert = validWidgetTypes.includes(widgetType) ? widgetType : null;
 console.log("widgetTypeToInsert:", widgetTypeToInsert);
  try {
    const conexion = await connectDB();

    // Verifica si el usuario ya tiene este dispositivo
    const [existingDevice] = await conexion.query(
      `
      SELECT * FROM usuario_dispositivos
      WHERE user_id = ? AND device_id = ?
    `,
      [userId, deviceId]
    );

    if (existingDevice && existingDevice.length > 0) {
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
        INSERT INTO usuario_dispositivos (user_id, device_id, custom_name, widget_type)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE custom_name = VALUES(custom_name), widget_type = VALUES(widget_type)
      `,
        [userId, deviceId, customName, widgetTypeToInsert]
      );

      callback({
        status: "success",
        message: "Dispositivo insertado correctamente.",
      });
    }
  } catch (error) {
    console.log("Error al actualizar el dispositivo:", error);
    callback({
      status: "error",
      error: "Error al actualizar el dispositivo.",
      error,
    });
  }
}

export { getPersonalDevices, setNamePersonalDevice };
