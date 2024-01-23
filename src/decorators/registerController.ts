import { Container } from 'typedi';
import { Router } from 'express';
import type { Application, Request, Response, RequestHandler } from 'express';

import type { Class } from '@/types';
import type { Controller, RouteMetadata } from './types';
import config from '@/config';
import { CONTROLLER_BASE_PATH, CONTROLLER_ROUTES } from '@/constants';
import { ApplicationError } from '@/errors';
import { send } from '@/utils/responseHelper';

export const registerController = (app: Application, controllerClass: Class<object>) => {
  const controller = Container.get(controllerClass as Class<Controller>);
  const controllerBasePath = Reflect.getMetadata(CONTROLLER_BASE_PATH, controllerClass) as string | undefined;
  if (!controllerBasePath)
    throw new ApplicationError('Controller is missing the RestController decorator', {
      extra: { controllerName: controllerClass.name },
    });

  const routes = Reflect.getMetadata(CONTROLLER_ROUTES, controllerClass) as RouteMetadata[];

  if (routes.length > 0) {
    const router = Router({ mergeParams: true });
    const restBasePath = config.get('endpoints.rest');
    const prefix = `/${[restBasePath, controllerBasePath].join('/')}`.replace(/\/+/g, '/').replace(/\/$/, '');

    console.log('registerController', controllerClass.name, prefix, routes);
    routes.forEach(({ method, path, middlewares: routeMiddlewares, handlerName, usesTemplates }) => {
      const handler = async (req: Request, res: Response) => controller[handlerName](req, res);
      router[method](path, ...routeMiddlewares, usesTemplates ? handler : send(handler));
    });
    app.use(prefix, router);
  }
};
