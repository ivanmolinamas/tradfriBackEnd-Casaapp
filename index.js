import { connectTradfri } from "./tradfri/connect.js";
import { app, io, server } from "./services/conectServices.js";
import { conectar } from "./services/db.js";
import { syncDevicesWithDatabase } from "./services/updateDevices.js";
import { handleSocketConnection } from "./control/socket.js"; // Importa la función
import { ensureAdminUser } from "./control/db.js";
// Map para almacenar la relación socket.id -> userId
export const connectedUsers = new Map();

// Llamar a la función para configurar los manejadores de socket
handleSocketConnection(io);

// conexión a la base de datos, inicio del servidor, etc.
conectar(); //Conexion a la base de datos

async function startApp() {
    await connectTradfri();
    setTimeout(syncDevicesWithDatabase, 3000);
}

// Iniciar la aplicación
startApp();

// aseguramos el usuario admin para poder acceder siempre
ensureAdminUser()

// Iniciar el servidor en el puerto 4000
server.listen(4000, "0.0.0.0", () => {
    console.log("Servidor WebSocket en ejecución en el puerto 4000");
});