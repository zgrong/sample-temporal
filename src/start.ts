import 'reflect-metadata';

import { spawn } from 'node:child_process';
import { Container } from 'typedi';
import { Server } from './Server';

const server = Container.get(Server);

(async function () {
  console.log('Starting Controller Server');
  await server.start();

  const worker = spawn('npx', ['ts-node', './src/temporal/worker.ts']);
  worker.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  worker.on('error', (err) => {
    console.error('Failed to start child process.', err);
  });

  worker.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
  });

  worker.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
  });
})();
