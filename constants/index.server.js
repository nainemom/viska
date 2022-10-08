import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

export const ROOT_DIR = resolve(fileURLToPath(dirname(import.meta.url)), '../../');

export const SERVER_PORT = parseInt(process.env.VISKA_SERVER_PORT || 3002, 10);

export const SERVER_ACCESS_KEY = process.env.VISKA_SERVER_ACCESS_KEY || '';

export const SERVER_ALLOWED_CLIENTS = true; // means all client can connect
