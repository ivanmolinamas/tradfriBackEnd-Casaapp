import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./.env") });

export const gatewayIp = process.env.GATEWAY_IP;
export const securityCode = process.env.SECURITY_CODE;

export const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

export const SECRET_KEY = process.env.SECRET_KEY;
export const SALT_ROUNDS = 1; // numero de salt para encriptar
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);