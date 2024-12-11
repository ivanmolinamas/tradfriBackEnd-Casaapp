import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/config.js";
import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.js";
import { registerUser, loginUser } from "../auth/authRoutes";


export function authorizeRoles(...allowedRoles) {
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




const router = express.Router();
/*
router.post("/register", verifyToken, isAdmin, registerUser); // Solo admin puede registrar
router.post("/login", loginUser); // Inicio de sesión abierto
router.get("/usuarios", verifyToken, async (req, res) => {
  // Solo usuarios autenticados pueden acceder aquí
  res.json({ message: `Hola ${req.user.rol}, estás autenticado` });
});
*/
export default router;