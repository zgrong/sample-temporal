import { Container, Service } from 'typedi';
import { readFile } from 'fs/promises';
import express from 'express';
import type { Server } from 'http';
import bodyParser from 'body-parser';

import config from '@/config';
import { Logger } from '@/Logger';
import { inDevelopment } from '@/constants';
import { generateNanoId } from '@/utils/generators';

@Service()
export abstract class AbstractServer {
  protected logger: Logger;

  protected server!: Server;

  readonly app: express.Application;

  protected protocol: string;

  protected sslKey: string;

  protected sslCert: string;

  readonly uniqueInstanceId: string;

  constructor() {
    this.app = express();
    this.app.disable('x-powered-by');

    this.protocol = config.get('protocol');
    this.sslKey = config.get('ssl_key');
    this.sslCert = config.get('ssl_cert');

    this.uniqueInstanceId = 'view-' + generateNanoId();

    this.logger = Container.get(Logger);

    this.init();
  }

  private async setupHealthCheck() {
    // health check should not care about DB connections
    this.app.get('/healthz', async (_req, res) => {
      res.send({ status: 'ok' });
    });
  }

  async init(): Promise<void> {
    const { app, protocol, sslKey, sslCert } = this;

    if (protocol === 'https' && sslKey && sslCert) {
      const https = await import('https');
      this.server = https.createServer(
        {
          key: await readFile(this.sslKey, 'utf8'),
          cert: await readFile(this.sslCert, 'utf8'),
        },
        app
      );
    } else {
      const http = await import('http');
      this.server = http.createServer(app);
    }

    const PORT = config.get('port');
    const ADDRESS = config.get('listen_address');

    this.server.on('error', (error: Error & { code: string }) => {
      if (error.code === 'EADDRINUSE') {
        console.log(
          `FlowEngine's port ${PORT} is already in use. Do you have another instance of FlowEngine running already?`
        );
        process.exit(1);
      }
    });

    await new Promise<void>((resolve) => this.server.listen(PORT, ADDRESS, () => resolve()));

    await this.setupHealthCheck();

    console.log(`FlowEngine ready on ${ADDRESS}, port ${PORT}`);
  }

  async configure(): Promise<void> {
    // Additional configuration in derived classes
  }

  async start(): Promise<void> {
    // this.setupCommonMiddlewares();

    if (inDevelopment) {
      // this.setupDevMiddlewares();
    }

    // Setup body parsing middleware after the webhook handlers are setup
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());

    await this.configure();

    // default index
    this.app.use('/', (req, res) => {
      if (req.url === '/') {
        res.send('hello FlowEngine');
      }
    });
  }
}
