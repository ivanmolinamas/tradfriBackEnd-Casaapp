import {
    toggleLight,
    setDimmerLight,
    setTemperature,
    toggleLight2,
} from "../control/light.js";
import {
    newUser,
    login,
    verifyTokenHandler,
    getUsers,
    removeUser,
    toggleUserRole,
} from "../control/db.js";
import {
    getPersonalDevices,
    setNamePersonalDevice,
} from "../control/adminDevices.js";
import { getUserDevices } from "../tradfri/devices.js";
import { connectedUsers } from "../index.js";

// Función para manejar las conexiones de Socket.IO
export function handleSocketConnection(io) {
    io.on("connection", (socket) => {
        console.log("Nuevo cliente conectado socketIo");

        // Maneja la conexión de un nuevo usuario y el envío del estado inicial de los dispositivos
        socket.on("setIdUser", async (data) => {
            console.log("Usuario conectado:", data);

            socket.userId = data.id;
            connectedUsers.set(socket.id, data.id);

            // Obtiene los dispositivos del usuario con nombres personalizados
            const { updatedLights, updatedPlugs } = await getUserDevices(data.id);

            // Emite el estado de los dispositivos al cliente
            socket.emit("devicesState", {
                lights: updatedLights,
                plugs: updatedPlugs,
            });
        });

        // Escucha la solicitud del estado de los dispositivos
        socket.on("getDevicesState", async (data) => {
            // Obtiene los dispositivos del usuario con nombres personalizados
            const { updatedLights, updatedPlugs } = await getUserDevices(data.id);
            console.log("Recibida solicitud de estado dispositivos para usuario");
            // Emite el estado de los dispositivos al cliente
            socket.emit("devicesState", {
                lights: updatedLights,
                plugs: updatedPlugs,
            });
        });

        // Escucha el evento para encender/apagar un dispositivo (toggle)
        socket.on("setToggleDevice", (data) => {
            const { id } = data;
            toggleLight(id);
        });

        // Escucha el evento para encender/apagar un dispositivo (toggle con callback)
        socket.on("setLightToggle2", async (data, callback) => {
            await toggleLight2(data, callback);
        });

        // Escucha el evento para ajustar el dimmer de un dispositivo
        socket.on("setDimmerDevice", async (data, callback) => {
            await setDimmerLight(data, callback);
        });

        // Escucha el evento para ajustar la temperatura de color de una luz
        socket.on("setTemperature", async (data, callback) => {
            await setTemperature(data, callback);
        });

        // Maneja la desconexión de un cliente
        socket.on("disconnect", () => {
            if (connectedUsers.has(socket.id)) {
                const userId = connectedUsers.get(socket.id);
                console.log(`Usuario con ID ${userId} y socket ${socket.id} desconectado.`);
                connectedUsers.delete(socket.id);
            }
        });

        // Eventos relacionados con la gestión de usuarios (base de datos)
        socket.on("register", async (data, callback) => {
            await newUser(data, callback);
        });

        socket.on("login", async (data, callback) => {
            await login(data, callback);
        });

        socket.on("getUsers", async (data, callback) => {
            await getUsers(data, callback);
        });

        socket.on("removeUser", async (data, callback) => {
            await removeUser(data, callback);
        });

        socket.on("toggleUserRole", async (data, callback) => {
            await toggleUserRole(data, callback);
        });

        // Maneja la verificación del token
        socket.on("verifyToken", async (data, callback) => {
            await verifyTokenHandler(data, callback);
        });

        // Eventos relacionados con la gestión de dispositivos personales
        socket.on("getPersonalDevices", async (data, callback) => {
            await getPersonalDevices(data, callback);
        });

        socket.on("setNamePersonalDevice", async (data, callback) => {
            await setNamePersonalDevice(data, callback);
        });
    });
}