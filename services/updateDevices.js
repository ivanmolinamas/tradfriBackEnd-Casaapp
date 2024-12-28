import { lightDevices, plugDevices } from "../tradfri/devices.js";
import mariadb from "mariadb";
import { DB_CONFIG } from "../config/env.js"; // Asegúrate de tener tu configuración de la base de datos aquí



export async function syncDevicesWithDatabase() {
  console.log("Sincronizando dispositivos con la base de datos...");
  // Conectar a la base de datos
  const connection = await mariadb.createConnection(DB_CONFIG);
  try {

    // Obtener todos los dispositivos actuales de bombillas y enchufes
    const lights = lightDevices(); // Array de bombillas
    const plugs = plugDevices(); // Array de enchufes

    //console.log("Bombillas:", lights);
    // Insertar o actualizar bombillas
    for (const light of lights) {
      await connection.execute(
        `
        INSERT INTO dispositivos (ID_device, name_device,  type_device, widget_type)
        VALUES (?, ?, 1, 'slider') 
        ON DUPLICATE KEY UPDATE
          name_device = VALUES(name_device),
          type_device = VALUES(type_device)
        `,
        [light.id, light.name]
      );
      console.log(`Sincronizado bombilla: ${light.id} - ${light.name}`);
    }

    // Insertar o actualizar enchufes
    for (const plug of plugs) {
      await connection.execute(
        `
        INSERT INTO dispositivos (ID_device, name_device, type_device, widget_type)
        VALUES (?, ?, 2, 'switch') 
        ON DUPLICATE KEY UPDATE
          name_device = VALUES(name_device),
          type_device = VALUES(type_device)
        `,
        [plug.id, plug.name]
      );
      console.log(`Sincronizado enchufe: ${plug.id} - ${plug.name}`);
    }

    // Cerrar conexión
    await connection.end();
    console.log("Sincronización completa con la base de datos.");
  } catch (error) {
    console.error("Error al sincronizar dispositivos con la base de datos:", error);
  }
}
