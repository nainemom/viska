import { getStatus } from './controllers/server.js';

export default (app, users) => {
  app.get('/status', (req, res) => getStatus({ req, res, users }));
};
