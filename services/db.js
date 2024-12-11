import mariadb from "mariadb";
import { DB_CONFIG } from "../config/env.js";


const pool = mariadb.createPool({
  host: DB_CONFIG.host, // Dirección del servidor
  user: DB_CONFIG.user, // Tu usuario de MariaDB
  password: DB_CONFIG.password, // Tu contraseña de MariaDB
  database: DB_CONFIG.database, // Nombre de la base de datos
  port: DB_CONFIG.port, // Puerto de MariaDB
  connectionLimit: 5 // Límite de conexiones en el pool
});

async function conectar() {

  try {
    const conexion = await pool.getConnection();
    console.log("Conexión exitosa a MariaDB");
    return conexion;
  } catch (err) {
    console.error("Error al conectar a MariaDB: ", err);
  }
}

export { conectar }
