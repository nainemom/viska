import { version } from '../../package.json';

export const getStatus = async ({ res, users }) => {
  res.json({
    connections: users.size,
    version,
  });
};
