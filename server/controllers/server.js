import activeUsers from '../services/activeUsers.js';

export const getStatus = async (_req, res) => {
  res.writeHead(200);
  res.send(JSON.stringify({
    activeUsers: activeUsers.length,
    version: process.env.npm_package_version,
  }));
};
