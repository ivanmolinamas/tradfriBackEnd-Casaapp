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
    //console.log(rows);
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
        { userId: usuario.id, username: usuario.user ,rol: usuario.rol },
        SECRET_KEY,
        { expiresIn: "1h" } // Expira en 1 hora
      );
      //se devuelve el callback con el status y el token con su rol
      console.log(token, "user:", usuario.user, "rol:", usuario.rol);
      callback({
        status: "success",
        token,
        user: usuario.user,
        rol: usuario.rol,
        id: usuario.id,
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
async function verifyTokenHandler(data, callback) {
  console.log("Verificando token...");
  const token = data.token;
  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Decodifica el token

    if (decoded) {
      //console.log("Valor decoded:", decoded);
      const { username, rol, userId } = decoded; // Extraer usuario y rol del token
      //console.log("username y role: ", username, rol, userId);
      callback({
        status: "success",
        valid: true,
        userData: {
          userId,
          username,
          rol,
        },
      });

      console.log(`Token verificado correctamente para el usuario: ${username}, rol: ${rol}`);
    } else {
      callback({
        status: "error",
        valid: false,
        message: "Token no válido",
      });
    }
  } catch (error) {
    console.error("Error verificando el token:", error);
    callback({
      status: "error",
      valid: false,
      message: "Token expirado o inválido",
    });
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
//console.log("usuarios:",rows);
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

// Cambiar el rol de un usuario (de "usuario" a "admin" y viceversa)
async function toggleUserRole(data, callback) {
  const userID = data.userID; // ID del usuario cuyo rol se va a cambiar

  console.log("Cambiando rol del usuario con ID:", userID);

  // Verificar que se proporcione el ID del usuario
  if (!userID) {
    console.log("Falta el ID del usuario");
    return callback({
      status: "error",
      message: "ID del usuario no proporcionado",
    });
  }

  try {
    // Conexión a la base de datos
    const conexion = await connectDB();

    // Consultar el rol actual del usuario
    const queryObtenerRol = "SELECT rol FROM usuarios WHERE id = ?";
    const [rows] = await conexion.query(queryObtenerRol, [userID]);
    if (rows.length === 0) {
      console.log("El usuario no existe");
      return callback({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    const rolActual = rows.rol;
    console.log("valor rolActual:", rolActual);
    console.log("Rol actual del usuario:", rolActual);

    // Determinar el nuevo rol
    const nuevoRol = rolActual === "usuario" ? "admin" : "usuario";

    // Actualizar el rol en la base de datos
    const queryActualizarRol = "UPDATE usuarios SET rol = ? WHERE id = ?";
    const resultado = await conexion.query(queryActualizarRol, [nuevoRol, userID]);

    if (resultado.affectedRows > 0) {
      console.log("Rol del usuario actualizado correctamente a:", nuevoRol);
      return callback({
        status: "success",
        message: "Rol del usuario actualizado correctamente",
        nuevoRol: nuevoRol,
      });
    } else {
      console.log("No se pudo actualizar el rol del usuario");
      return callback({
        status: "error",
        message: "Error al actualizar el rol del usuario",
      });
    }
  } catch (error) {
    // Manejar errores y retornar mensaje al cliente
    console.error("Error al cambiar el rol del usuario:", error);
    return callback({
      status: "error",
      message: "Error interno del servidor al cambiar el rol del usuario",
    });
  }
}

// Cambiar la contraseña de un usuario
async function changePassword(data, callback) {
  const { userID, newPassword } = data;

  console.log("Cambiando contraseña del usuario con ID:", userID);

  // Verificar que se proporcionen los datos necesarios
  if (!userID || !newPassword) {
    console.log("Faltan datos (ID del usuario o nueva contraseña)");
    return callback({
      status: "error",
      message: "Datos incompletos, proporcione el ID del usuario y la nueva contraseña",
    });
  }

  try {
    // Conexión a la base de datos
    const conexion = await connectDB();

    // Verificar si el usuario existe
    const queryVerificarUsuario = "SELECT * FROM usuarios WHERE id = ?";
    const [rows] = await conexion.query(queryVerificarUsuario, [userID]);

    if (rows.length === 0) {
      console.log("El usuario no existe");
      return callback({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Actualizar la contraseña en la base de datos
    const queryActualizar = "UPDATE usuarios SET password = ? WHERE id = ?";
    const resultado = await conexion.query(queryActualizar, [hashedPassword, userID]);

    if (resultado.affectedRows > 0) {
      console.log("Contraseña actualizada correctamente");
      return callback({
        status: "success",
        message: "Contraseña actualizada correctamente",
      });
    } else {
      console.log("No se pudo actualizar la contraseña");
      return callback({
        status: "error",
        message: "Error al actualizar la contraseña",
      });
    }
  } catch (error) {
    // Manejar errores y retornar mensaje al cliente
    console.error("Error al cambiar la contraseña:", error);
    return callback({
      status: "error",
      message: "Error interno del servidor al cambiar la contraseña",
    });
  }
}

// Función para crear y asegurar que tenemos un usuario admin en la base de datos
async function ensureAdminUser() {
  console.log("Verificando existencia de usuario admin...");

  try {
    const conexion = await connectDB();

    // Buscar un usuario con rol 'admin'
    const queryBuscarAdmin = "SELECT * FROM usuarios WHERE user = 'admin'";
    const [rows] = await conexion.query(queryBuscarAdmin);

    // comprobamos que no hay usuario admin
    if (rows != undefined ) {
      console.log("Ya existe un usuario admin en la base de datos.");
      return { status: "success", message: "Usuario admin ya existe" };
    }

    console.log("No se encontró un usuario admin, creando uno nuevo...");

    // Datos predeterminados para el nuevo admin
    const adminUser = {
      user: "admin",
      email: "admin@example.com",
      password: "admin", // Cambiar esto por una contraseña segura
      rol: "admin",
    };

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(adminUser.password, SALT_ROUNDS);

    // Insertar el nuevo usuario admin en la base de datos
    const queryCrearAdmin =
      "INSERT INTO usuarios (user, email, password, rol) VALUES (?, ?, ?, ?)";
    await conexion.query(queryCrearAdmin, [
      adminUser.user,
      adminUser.email,
      hashedPassword,
      adminUser.rol,
    ]);

    console.log("Usuario admin creado exitosamente.");
    return { status: "success", message: "Usuario admin creado exitosamente" };
  } catch (error) {
    console.error("Error al verificar o crear usuario admin:", error);
    return { status: "error", message: "Error interno del servidor" };
  }
}


// Exportar funciones
export { newUser , login, verifyTokenHandler, getUsers, removeUser, toggleUserRole, changePassword , ensureAdminUser};
