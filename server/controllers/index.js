import { parse, URLSearchParams } from 'url';
import { SERVER_ALLOWED_ORIGINS, SERVER_ACCESS_KEY } from '../../constants/index.server.js';
import activeUsers from '../services/activeUsers.js';
import { pbkdf2Sync } from 'crypto';
import { createWsMessage, parseWsMessage } from '../../utils/wsMessage.js';
import { getStatus } from './server.js';
import { sendMessage } from './message.js';


export const httpRequestController = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', SERVER_ALLOWED_ORIGINS);
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');

  const { pathname } = parse(req.url);

  if (req.headers.get('X-ACCESS-KEY') !== SERVER_ACCESS_KEY) {
    return res.end();
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(202);
    return res.end();
  }

  if (pathname === '/' && req.method === 'GET') {
    return getStatus(req, res);
  }

  res.writeHead(404);
  return res.end();
}

export const serverUpgradeController = (req, socket, head) => {
  const { query } = parse(req.url);
  const searchParams = new URLSearchParams(query);

  if (searchParams.get('access_key') !== SERVER_ACCESS_KEY) {
    socket.destroy();
  }
}

export const wsConnectionController = (socket, req) => {
  const { query } = parse(req.url);
  const searchParams = new URLSearchParams(query);
  const id = pbkdf2Sync(searchParams.get('passprase'), SERVER_ACCESS_KEY, 10000, 32, 'sha512').toString('hex');
  activeUsers.set(id, socket);

  socket.send(createWsMessage('identify', id));


  socket.on('message', (rawData) => {
    const { event, data } = parseWsMessage(rawData);
    if (event === 'message') {
      return sendMessage({ socket, id }, data);
    }
  });


}
