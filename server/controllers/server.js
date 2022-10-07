import { resolve as pathResolve, dirname } from 'path';
import { readFileSync } from 'fs';
import { SERVER_ENTER_KEY, ROOT_DIR } from '../constants/index.js';

const { version } = JSON.parse(readFileSync(pathResolve(ROOT_DIR, './package.json')));

export const getStatus = async ({ res, users }) => {
  res.json({
    connections: users.size,
    version,
    public: SERVER_ENTER_KEY.length > 0,
  });
};
