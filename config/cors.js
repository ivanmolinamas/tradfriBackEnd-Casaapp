import cors from "cors";

export const corsConfig = cors({
  origin: "*", // Puedes ajustarlo para restringir el origen en producción
});