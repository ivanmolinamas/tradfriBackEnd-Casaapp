import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // para encriptar las contraseñas
//import getPool  from "../services/db.js"; // Conexión a la base de datos
import { SECRET_KEY, SALT_ROUNDS } from "../config/env.js"; // Clave secreta en un archivo separado y el numero de salt para encriptar

import { conectar as connectDB } from "../services/db.js";

async function newUser(data, callback) {
 // { user, email, password, rol = "usuario" }
// const { user, email, password, rol } = req.body;
const { user, password, email} = data;
const rol = data.rol || "usuario";
  console.log("Registrando usuario");
  console.log("usuario:", user, "email:", email, "password:", password, rol);

  // verificamos que estan todos los datos antes de seguir
  if (user.length === 0 || password.length === 0 || email.length === 0) {
    console.log("Falta rellenar campos");
    return callback({
      status: "error",
      message: "Datos incompletos, compruebe haber rellenado todos los campos",
    });
  }

  try {
    const conexion = await connectDB();
    console.log("Registrando usuario...");

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); //codificamos la contraseña
    // comprobar que el usuario no existe

    //const query = "SELECT * FROM usuarios WHERE user = ? OR email = ?"; //consulta query
    const query = "SELECT * FROM usuarios WHERE user = ? "; //consulta query
    const rows = await conexion.query(query, [user]); // realizamos la consulta
    console.log("Comprobando si el usuario ya existe");
    console.log(rows);
    console.log("Resultados de búsqueda de usuario existente:", rows);

    //comprobamos que no existe el usuario
    if (rows.length > 0) {
      console.log("El usuario ya existe");
      return callback({
        status: "error",
        message: "El usuario o el email ya existen",
      });
    }

    // Insertar en la base de datos
    const result = await conexion.query(
      "INSERT INTO usuarios (user, email, password, rol) VALUES (?, ?, ?, ?)",
      [user, email, hashedPassword, rol || "usuario"]
    );
    console.log("usuario registrado correctamente!");
    return callback({
      status: "success",
      message: "Usuario registrado",
      user: user,
    });
  } catch (error) {
    //si hay error, devolvemos el error y mostramos por consola
    console.error("Error durante el registro:", error);
    return callback({
      status: "error",
      message: "Error al registrar el usuario",
    });
  }
     
   
}

async function login(data, callback) {
  const { user, password } = data;
  // const { user, password } = req.body;
  console.log("Intentando iniciar sesión");
  console.log("user:", user, "password:", password);

  //comprobamos que tenemos los datos antes de seguir
  if (user.length === 0 || password.length === 0) {
    console.log("Faltan datos");
    return callback({
      status: "error",
      message: "Falta usuario y/o contraseña",
    });
  } else {
    console.log("Datos recibidos");
    try {
      //si nos han pasado datos, comprobamos esos datos en la base de datos
      const conexion = await connectDB();
      //console.log("Conexión exitosa");
      const [rows] = await conexion.query(
        "SELECT * FROM usuarios WHERE user = ?",
        [user]
      );
      //console.log(rows);
      if (rows === undefined) {
        // si no hemos encontrado el usuario, devolvemos error
        console.log("Usuario no encontrado");
        return callback({ status: "error", message: "Usuario no encontrado" });
      }
      //console.log(rows);
      const usuario = rows;
      //console.log(usuario);

      const isPasswordValid = await bcrypt.compare(password, usuario.password); //comparamos la contraseña
      if (!isPasswordValid)
        // si la contraseña no es correcta, devolvemos error
        return callback({ status: "error", message: "Contraseña incorrecta" });
      //if (password === usuario.password) console.log("Contraseña correcta");

      // Genera un token JWT con el rol
      const token = jwt.sign(
        { userId: usuario.id, rol: usuario.rol },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      //se devuelve el callback con el status y el token con su rol
      console.log(token, "user:", usuario.user, "rol:", usuario.rol);
      callback({
        status: "success",
        token,
        user: usuario.user,
        rol: usuario.rol,
      });
      console.log(
        "Inicio de sesión exitoso. ID",
        usuario.id,
        "username: ",
        usuario.user
      );
    } catch (error) {
      //si hay error, devolvemos el error y mostramos por consola
      console.error("Error en el evento 'login':", error);
      callback({ status: "error", message: "Error interno del servidor" });
    } 
    
  }
}
//verificar token
// Evento para verificar el token.
//async function verifyTokenHandler(socket) {
async function verifyTokenHandler(data, callback) {
  const token = data.token;

  try {
    const user = jwt.verify(token, SECRET_KEY); // Verifica el token JWT

    if (user) {
      callback({
        status: "success",
        token,
      });
      console.log("Token verificado correctamente", user);
    } else {
      callback("verifyTokenResponse", { message: false });
    }
  } catch (error) {
    console.error("Error verificando el token:", error);
    callback("verifyTokenResponse", { valid: false });
  }
}


// Obtener todos los usuarios
async function getUsers(callback) {
  console.log("Obteniendo lista de usuarios...");

  try {
    // Conectar a la base de datos
    const conexion = await connectDB();

    // Consultar todos los usuarios de la base de datos (sin incluir la contraseña)
    const query = "SELECT id, user, email, rol FROM usuarios";
    const rows = await conexion.query(query);

    //console.log("Usuarios obtenidos correctamente:", rows);

    // Verificar si se encontraron usuarios
    if (rows.length === 0) {
      return callback({
        status: "error",
        message: "No se encontraron usuarios en la base de datos",
      });
    }
console.log("usuarios:",rows);
    // Retornar la lista de usuarios
    return callback({
      status: "success",
      message: "Usuarios obtenidos correctamente",
      usuarios: rows,
    });
  } catch (error) {
    // Manejar errores y retornar mensaje al cliente
    console.error("Error al obtener la lista de usuarios:", error);
    return callback({
      status: "error",
      message: "Error interno del servidor al obtener usuarios",
    });
  }
}


// Eliminar usuarios
async function removeUser(data, callback) {
  console.log("valor data:",data.userID)
  const id  = data.userID; // Extraemos el ID del usuario a eliminar

  console.log("Eliminando usuario con ID:", id);

  // Verificamos que se pase el ID
  if (!id) {
    console.log("Falta el ID del usuario");
    return callback({
      status: "error",
      message: "ID del usuario no proporcionado",
    });
  }

  try {
    // Conexión a la base de datos
    const conexion = await connectDB();

    // Comprobar si el usuario existe
    const queryVerificar = "SELECT * FROM usuarios WHERE id = ?";
    const [rows] = await conexion.query(queryVerificar, [id]);

    if (rows.length === 0) {
      console.log("El usuario no existe");
      return callback({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Eliminar el usuario
    const queryEliminar = "DELETE FROM usuarios WHERE id = ?";
    const resultado = await conexion.query(queryEliminar, [id]);

    if (resultado.affectedRows > 0) {
      console.log("Usuario eliminado correctamente");
      return callback({
        status: "success",
        message: "Usuario eliminado correctamente",
      });
    } else {
      console.log("No se pudo eliminar el usuario");
      return callback({
        status: "error",
        message: "Error al eliminar el usuario",
      });
    }
  } catch (error) {
    // Manejar errores y retornar mensaje al cliente
    console.error("Error al eliminar el usuario:", error);
    return callback({
      status: "error",
      message: "Error interno del servidor al eliminar el usuario",
    });
  }
}





export { newUser , login, verifyTokenHandler, getUsers, removeUser };
