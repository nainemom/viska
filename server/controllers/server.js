import { version } from '../../package.json';

export const getStatus = async ({ res, users }) => {
  const response = {
    activeConnections: users.size,
    version,
  };
  res.json(response);
};
