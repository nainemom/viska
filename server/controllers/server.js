import { version } from '../../package.json';
import { SERVER_ENTER_KEY } from '../constants/index.js';


export const getStatus = async ({ res, users }) => {
  res.json({
    connections: users.size,
    version,
    public: SERVER_ENTER_KEY.length > 0,
  });
};
