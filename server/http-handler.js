import path from 'path';
import express from 'express';
import { getStatus } from './controllers/server';

export default (expressApp, users) => {
  expressApp.use('/', express.static(path.join(__dirname, '../dist')));
  expressApp.get('/status', (req, res) => getStatus(req, res, users));
  expressApp.get('/ping', (_req, res) => res.send('pong, my friend!'));
};
