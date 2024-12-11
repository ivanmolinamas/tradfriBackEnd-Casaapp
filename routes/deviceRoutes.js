import express from "express";
import { getDevices } from "../controllers/deviceController.js";

const router = express.Router();

// Ruta para obtener la lista con dispositivos
router.get("/devices", getDevices);

export default router;

import { conectar } from "../services/db.js";

router.get("/db", (req, res) => {
  
    

  async function conect() {
    try{
        const conexion = await conectar();
        console.log("Conexión exitosa a MariaDB");
        
        const query = "select * from usuarios";

        const rows = await conexion.query(query);
        res.json(rows);

    }catch (e){
        console.error("Error al conectar a MariaDB: ", e);
    }
  }

  conect()
});
