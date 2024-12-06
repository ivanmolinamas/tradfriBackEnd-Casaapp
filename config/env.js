import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./.env") });

export const gatewayIp = process.env.GATEWAY_IP;
export const securityCode = process.env.SECURITY_CODE;