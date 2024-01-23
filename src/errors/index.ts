import callsites from 'callsites';

type Level = 'warning' | 'error' | 'fatal' | 'info';

export type ReportingOptions = {
  level?: Level;
  extra?: any;
};

export class ApplicationError extends Error {
  level: Level;

  readonly extra?: any;

  readonly packageName?: string;

  constructor(message: string, { level, extra, ...rest }: Partial<ErrorOptions> & ReportingOptions = {}) {
    super(message, rest);
    this.level = level ?? 'error';
    this.extra = extra;

    try {
      const filePath = callsites()[2].getFileName() ?? '';
      const match = /packages\/([^\/]+)\//.exec(filePath)?.[1];
    } catch {}
  }
}

export abstract class ResponseError extends ApplicationError {
  /**
   * Creates an instance of ResponseError.
   * Must be used inside a block with `ResponseHelper.send()`.
   */
  constructor(
    message: string,
    // The HTTP status code of  response
    readonly httpStatusCode: number,
    // The error code in the response
    readonly errorCode: number = httpStatusCode,
    // The error hint the response
    readonly hint: string | undefined = undefined
  ) {
    super(message);
    this.name = 'ResponseError';
  }
}
