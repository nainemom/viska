import { SERVER_ACCESS_KEY } from '../../constants/index.server.js';

export const getStatus = async ({ res, users }) => {
  res.json({
    connections: users.size,
    version: process.env.npm_package_version,
    public: SERVER_ACCESS_KEY.length === 0,
  });
};
