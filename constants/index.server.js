import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getStat } from '../utils/fs.server';

export const SERVER_PORT = parseInt(process.env.VISKA_SERVER_PORT || 3002, 10);

export const SERVER_ACCESS_KEY = process.env.VISKA_SERVER_ACCESS_KEY || '';

export const SERVER_ALLOWED_ORIGINS = '*'; // true means all client can connect


export const SSL_KEY_PATH = resolve(__dirname, '../ssl/key.pem');
export const SSL_CERT_PATH = resolve(__dirname, '../ssl/cert.pem');

export const SSL_KEY = getStat(SSL_KEY_PATH) === 'file' ? readFileSync(SSL_KEY_PATH) : undefined;
export const SSL_CERT = getStat(SSL_CERT_PATH) === 'file' ? readFileSync(SSL_CERT_PATH) : undefined;
