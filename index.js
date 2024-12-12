import { connectTradfri } from "./tradfri/connect.js"; // Asegúrate de importar correctamente
import deviceRoutes from "./routes/deviceRoutes.js"; // Importa las rutas
import lightRoutes from "./routes/lightRoutes.js";
import plugRoutes from "./routes/plugRoutes.js";
import { lightDevices, plugDevices } from "./tradfri/devices.js";
import { toggleLight, setDimmerLight, setTemperature } from "./control/light.js";
import { app, io, server } from "./services/conectServices.js";
import authRoutes from "./auth/authRoutes.js";
import { registrarUsuario , login } from "./control/db.js";
//import connectDB from "./services/db.js"; // Ruta correcta a tu archivo db.js


// Rutas para conexion con GET y POST
app.use("/api", deviceRoutes); // Usa el prefijo '/api' para las rutas de dispositivos
app.use("/light", lightRoutes); // Usa el prefijo '/light' para las rutas de bombillas
app.use("/plug", plugRoutes); // Usa el prefijo '/plug' para las rutas de enchufes

// Conexion a traves de socket io
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado socketIo");

  // Enviar estado de los dispositivos al cliente
  const lights = lightDevices();
  const plugs = plugDevices();
  //console.log(lights);
  socket.emit("devicesState", {
    lights,
    plugs,
  });

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
  // evento para dimmer
  socket.on("setDimmerDevice", (data) => {
    const { id, brightness } = data;
    setDimmerLight(id, brightness);
  });

  // evento para cambiar temperatura de color
  socket.on("setTemperature", (data) => {
    const { id, temperature } = data;
    setTemperature(id, temperature);
  });

  // Eventualmente puedes emitir un evento cuando un dispositivo cambia de estado
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });

// conexion con base de datos
socket.on("register", async (data, callback) => {
  try {
    const result = await registrarUsuario(data);
    callback({ status: "success", ...result });
  } catch (error) {
    callback({ status: "error", message: error.message }); // El mensaje de error viene directamente de la función
  }
});
/*
socket.on("login", async (data, callback) => {
  try {
    const result = await login(data);
    callback({ status: "success", ...result });
  } catch (error) {
    callback({ status: "error", message: error.message }); // El mensaje de error viene directamente de la función
  }
});
*/
socket.on("login", async (data, callback) => {
  await login(data, callback); // Pasa el callback correctamente
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
import {conectar} from "./services/db.js";

conectar();





// Conectar con el Gateway de IKEA
connectTradfri();

// Iniciar servidores de socket y por GET y POST
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

server.listen(4000,"0.0.0.0", () => {
  console.log("Servidor WebSocket en ejecución en el puerto 4000");
});

/*
Explicación del código
Configuración del servidor: Usamos Express para crear un servidor que escuche en un puerto específico.
Conexión al gateway: La función connectTradfri() establece la conexión y observa los dispositivos.
Rutas de la API:
GET /api/devices: Devuelve la lista de dispositivos disponibles en el tradfri.
GET /light/:id/state: Devuelve el estado de la bombilla especificada por su ID.
POST /light/:id/toggle: Alterna el estado de la bombilla especificada por su ID.
POST /plug/:id/toggle: Alterna el estado del enchufe especificado por su ID.
GET /plug/:id/state: Devuelve el estado del enchufe especificado por su ID.
Iniciar el servidor: El servidor comienza a escuchar en el puerto definido.
Cómo usar la API
Para verificar el estado de una bombilla:

Realiza una solicitud GET a http://localhost:3000/light/65551/state (reemplaza 65551 con el ID de tu bombilla).
Para alternar el estado de una bombilla:

Realiza una solicitud POST a http://localhost:3000/light/65537/toggle
Notas
Asegúrate de que el servidor esté en ejecución antes de hacer las solicitudes.
Puedes usar herramientas como Postman o cURL para probar las rutas de la API.

*/
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
