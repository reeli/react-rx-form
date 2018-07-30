import { NetworkEnvs } from "./network";

const config = (global as any).NODE_CONFIG || process.env.NODE_CONFIG || {};
export const API_BASE_URL: string = config.API_BASE_URL || "";
export const NETWORK_ENV: string = process.env.NETWORK_ENV || NetworkEnvs.internet;
