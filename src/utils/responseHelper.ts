import type { Request, Response } from 'express';
import { Readable } from 'node:stream';
import picocolors from 'picocolors';

import { ResponseError } from '@/errors';
import { inDevelopment } from '@/constants';

export function sendSuccessResponse(
  res: Response,
  data: any,
  raw?: boolean,
  responseCode?: number,
  responseHeader?: object
) {
  if (responseCode !== undefined) {
    res.status(responseCode);
  }

  if (responseHeader) {
    res.header(responseHeader);
  }

  if (data instanceof Readable) {
    data.pipe(res);
    return;
  }

  if (raw === true) {
    if (typeof data === 'string') {
      res.send(data);
    } else {
      res.json(data);
    }
  } else {
    res.json({
      data,
    });
  }
}

/**
 * Checks if the given error is a ResponseError. It can be either an
 * instance of ResponseError or an error which has the same properties.
 * The latter case is for external hooks.
 */
function isResponseError(error: Error): error is ResponseError {
  if (error instanceof ResponseError) {
    return true;
  }

  if (error instanceof Error) {
    return (
      'httpStatusCode' in error &&
      typeof error.httpStatusCode === 'number' &&
      'errorCode' in error &&
      typeof error.errorCode === 'number'
    );
  }

  return false;
}

interface ErrorResponse {
  code: number;
  message: string;
  hint?: string;
  stacktrace?: string;
}

export function sendErrorResponse(res: Response, error: Error) {
  let httpStatusCode = 500;

  const response: ErrorResponse = {
    code: 0,
    message: error.message ?? 'Unknown error',
  };

  if (isResponseError(error)) {
    if (inDevelopment) {
      console.error(picocolors.red(error.httpStatusCode), error.message);
    }

    //render custom 404 page for form triggers
    const { originalUrl } = res.req;
    if (error.errorCode === 404 && originalUrl) {
      const basePath = originalUrl.split('/')[1];

      const isFormTrigger = basePath.includes('form');

      if (isFormTrigger) {
        const isTestWebhook = basePath.includes('test');
        res.status(404);
        return res.render('form-trigger-404', { isTestWebhook });
      }
    }

    httpStatusCode = error.httpStatusCode;

    if (error.errorCode) {
      response.code = error.errorCode;
    }
    if (error.hint) {
      response.hint = error.hint;
    }
  }

  if (error.stack && inDevelopment) {
    response.stacktrace = error.stack;
  }

  res.status(httpStatusCode).json(response);
}

/**
 * A helper function which does not just allow to return Promises it also makes sure that
 * all the responses have the same format
 *
 *
 * @param {(req: Request, res: Response) => Promise<any>} processFunction The actual function to process the request
 */
export function send<T, R extends Request, S extends Response>(
  processFunction: (req: R, res: S) => Promise<T>,
  raw = false
) {
  return async (req: R, res: S) => {
    try {
      const data = await processFunction(req, res);

      if (!res.headersSent) sendSuccessResponse(res, data, raw);
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      sendErrorResponse(res, error as Error);
    }
  };
}
