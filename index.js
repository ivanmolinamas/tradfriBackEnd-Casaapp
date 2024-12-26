import { connectTradfri } from "./tradfri/connect.js"; // Asegúrate de importar correctamente
import deviceRoutes from "./routes/deviceRoutes.js"; // Importa las rutas
import lightRoutes from "./routes/lightRoutes.js";
import plugRoutes from "./routes/plugRoutes.js";
import {
  lightDevices,
  plugDevices,
  getUserDevices,
} from "./tradfri/devices.js";
import {
  toggleLight,
  setDimmerLight,
  setTemperature,
  toggleLight2,
} from "./control/light.js";
import { app, io, server } from "./services/conectServices.js";
import authRoutes from "./auth/authRoutes.js";
import {
  newUser,
  login,
  verifyTokenHandler,
  getUsers,
  removeUser,
  toggleUserRole,
} from "./control/db.js";
import {
  getPersonalDevices,
  setNamePersonalDevice,
} from "./control/adminDevices.js";
import { syncDevicesWithDatabase } from "./services/updateDevices.js";

//import connectDB from "./services/db.js"; // Ruta correcta a tu archivo db.js

// Rutas para conexion con GET y POST
app.use("/api", deviceRoutes); // Usa el prefijo '/api' para las rutas de dispositivos
app.use("/light", lightRoutes); // Usa el prefijo '/light' para las rutas de bombillas
app.use("/plug", plugRoutes); // Usa el prefijo '/plug' para las rutas de enchufes

export const connectedUsers = new Map(); // Map para almacenar la relación socket.id -> userId
// Conexion a traves de socket io
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado socketIo");

  // Gestion del envío del estado de los dispositivos
  socket.on("setIdUser", async (data) => {
    console.log("Usuario conectado:", data);

    // Guardar el id del usuario en el objeto socket
    socket.userId = data.id;
    connectedUsers.set(socket.id, data.id); // Almacena en el Map

    // Obtiene los dispositivos con los nombres personalizados
    const { updatedLights, updatedPlugs } = await getUserDevices(data.id);

    // Enviar estado de los dispositivos al cliente con los nombres actualizados
    socket.emit("devicesState", {
      lights: updatedLights,
      plugs: updatedPlugs,
    });
  });

  // Escucha pedido de datos de los dispositivos
  socket.on("getDevicesState", async (data) => {
    // Obtiene los dispositivos con los nombres personalizados
    const { updatedLights, updatedPlugs } = await getUserDevices(data.id);
    console.log("Recibida solicitud de estado dispositivos para usuario");
    socket.emit("devicesState", {
      lights: updatedLights,
      plugs: updatedPlugs,
    });
  });

  /*
  socket.emit("devicesState", {
    lights,
    plugs,
  });
  // Escucha pedido de datos de los dispositivos
  socket.on("getDevicesState", (data) => {
    console.log("Recibida solicitud de estado dispositivos para usuario");
    socket.emit("devicesState", {
      lights,
      plugs,
    });
  });
  */

  // Escuchar encendido y apagado de bombillas
  socket.on("setLightToggle", (lightId) => {
    console.log("Encendido/Apagado de bombilla:", lightId);
    // Lógica para encender o apagar la bombilla con el ID proporcionado
  });
  // Evento de encendido y apagado
  socket.on("setToggleDevice", (data) => {
    const { id } = data;
    toggleLight(id);
  });
  socket.on("setLightToggle2", async (data, callback) => {
    await toggleLight2(data, callback);
  });

  socket.on("setDimmerDevice", async (data, callback) => {
    await setDimmerLight(data, callback);
  });

  socket.on("setTemperature", async (data, callback) => {
    await setTemperature(data, callback);
  });

  // Eventualmente puedes emitir un evento cuando un dispositivo cambia de estado
  /*
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
  */
  socket.on("disconnect", () => {
    if (connectedUsers.has(socket.id)) {
      const userId = connectedUsers.get(socket.id);
      console.log(`Usuario con ID ${userId} y socket ${socket.id} desconectado.`);
      connectedUsers.delete(socket.id);
    }
  });
  // conexion con base de datos
  socket.on("register", async (data, callback) => {
    await newUser(data, callback);
  });

  socket.on("login", async (data, callback) => {
    await login(data, callback); // Pasa el callback correctamente
  });
  // Obtener los usuarios
  socket.on("getUsers", async (data, callback) => {
    await getUsers(data, callback); // Pasa el callback correctamente
  });
  // Eliminar usuarios
  socket.on("removeUser", async (data, callback) => {
    await removeUser(data, callback); // Pasa el callback correctamente
  });
  // Cambia el rol del usuario
  socket.on("toggleUserRole", async (data, callback) => {
    await toggleUserRole(data, callback); // Pasa el callback correctamente
  });

  // Maneja la verificación del token
  //verifyTokenHandler(socket);
  socket.on("verifyToken", async (data, callback) => {
    await verifyTokenHandler(data, callback); // Pasa el callback correctamente
  });

  /** funciones de control de dispositivos */

  // Obtener dispositivos personales
  socket.on("getPersonalDevices", async (data, callback) => {
    await getPersonalDevices(data, callback); // Pasa el callback correctamente
  });
  // Obtener dispositivos personales
  socket.on("setNamePersonalDevice", async (data, callback) => {
    await setNamePersonalDevice(data, callback); // Pasa el callback correctamente
  });
});

// Usa el prefijo '/api' para las rutas de dispositivos
app.use("/auth", authRoutes);

// DEBUG
// Llama a connectDB antes de iniciar el servidor
/*
(async () => {
  await connectDB(); // Aquí debería ejecutarse la conexión
})();
*/

import { conectar } from "./services/db.js";

conectar();

// Conectar con el Gateway de IKEA
async function startApp() {
  await connectTradfri(); // Conectar al Gateway
  setTimeout(syncDevicesWithDatabase, 3000); // Espera 5 segundos
}

startApp();

// Iniciar servidores de socket y por GET y POST
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

server.listen(4000, "0.0.0.0", () => {
  console.log("Servidor WebSocket en ejecución en el puerto 4000");
});

/*
Lista bombillas en casa
Bombilla ID: 65537 = Oficina
Bombilla ID: 65550 = Lampara Cristina
Bombilla ID: 65551 = Lampara Ivan 
Bombilla ID: 65562 = Mesa 1
Bombilla ID: 65564 = Mesa 2
Bombilla ID: 65565 = Pasillo
Enchufe ID: 65546 = Luz del sofa
*/
