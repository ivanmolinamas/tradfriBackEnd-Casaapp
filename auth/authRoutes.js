import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // para encriptar las contraseñas
//import getPool  from "../services/db.js"; // Conexión a la base de datos
import { SECRET_KEY, SALT_ROUNDS } from "../config/env.js"; // Clave secreta en un archivo separado y el numero de salt para encriptar

import { conectar as connectDB } from "../services/db.js";

const router = express.Router();

//const SECRET_KEY = "tu_clave_secreta"; // Usa una clave más segura en producción

// Registro
router.post("/register", async (req, res) => {
  const { user, email, password, rol } = req.body;
  console.log("Registrando usuario");
  console.log(user, email, password, rol);
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

    if (rows.length > 0) {
      console.log("El usuario ya existe");
      return res.status(400).json({ error: "El usuario o el email ya existen" });
    }

    // Insertar en la base de datos
    const result = await conexion.query(
      "INSERT INTO usuarios (user, email, password, rol) VALUES (?, ?, ?, ?)",
      [user, email, hashedPassword, rol || "usuario"]);
      console.log("usuario registrado correctamente!")

    res.status(201).json({ message: "Usuario registrado", id: result.id });
  } catch (error) {
    console.error("Error durante el registro:", error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

// Inicio de sesión
router.post("/login", async (req, res) => {
  const { user, password } = req.body;
  console.log("Intentando iniciar sesión");
  console.log(user, password);
  try {
    const conexion = await connectDB();
    console.log("Conexión exitosa");
    const [rows] = await conexion.query(
      "SELECT * FROM usuarios WHERE user = ?",
      [user]
    );
    console.log(rows);
    if (rows.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const usuario = rows;
    console.log(usuario);
    console.log("Usuario encontrado");
    console.log("pass", usuario.password);
    console.log("id", usuario.id);
    console.log("usuario", usuario.user);

    // FALTA ACTIVAR BCRYPT
     const isPasswordValid = await bcrypt.compare(password, usuario.password); //comparamos la contraseña
    if (!isPasswordValid) return res.status(401).json({ error: "Contraseña incorrecta" });
    //if (password === usuario.password) console.log("Contraseña correcta");

    // Genera un token JWT con el rol
    const token = jwt.sign(
      { userId: usuario.id, rol: usuario.rol },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token, rol: usuario.rol });
    //res.json({ rol: usuario.rol });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      if (!allowedRoles.includes(user.rol)) return res.sendStatus(403); // Rol no permitido
      req.user = user;
      next();
    });
  };
}

export default router;
