import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

export const ROOT_DIR = resolve(fileURLToPath(dirname(import.meta.url)), '../../');

export const SERVER_PORT = parseInt(process.env.VISKA_SERVER_PORT || 3002, 10);

export const SERVER_ENTER_KEY = process.env.VISKA_SERVER_ENTER_KEY || '';

export const IDENTITY_TYPES = {
  'temporary': 't',
  'permanent': 'p',
};
