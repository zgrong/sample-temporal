import type { Request, Response, RequestHandler } from 'express';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RouteMetadata {
  method: Method;
  path: string;
  handlerName: string;
  middlewares: RequestHandler[];
  usesTemplates: boolean;
}

export type Controller = Record<RouteMetadata['handlerName'], (req?: Request, res?: Response) => Promise<unknown>>;
