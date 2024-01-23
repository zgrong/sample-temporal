import { Container, Service } from 'typedi';

import type { Class } from '@/types';
import config from '@/config';
import FlowController from '@/controllers/FlowController';
import { registerController } from '@/decorators';
import { AbstractServer } from './AbstractServer';

@Service()
export class Server extends AbstractServer {
  constructor() {
    super();

    // this.app.engine('handlebars', expressHandlebars({ defaultLayout: false }));
    this.app.set('view engine', 'handlebars');
  }

  async start() {
    // if (!config.get('endpoints.disableUi')) {
    // }

    await super.start();
    this.logger.debug(`Server ID: ${this.uniqueInstanceId}`);
  }

  private async registerControllers() {
    const { app } = this;
    const controllers: Array<Class<object>> = [FlowController];
    controllers.forEach((controller) => registerController(app, controller));
  }

  async configure(): Promise<void> {
    console.log('Server.configure');
    await this.registerControllers();
  }
}
