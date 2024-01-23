import 'reflect-metadata';

import { Container } from 'typedi';
import { Server } from './Server';

const server = Container.get(Server);
(async function () {
  console.log('Starting server');
  await server.start();
})();
