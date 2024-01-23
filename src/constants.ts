export const LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug', 'verbose'] as const;

const { NODE_ENV, E2E_TESTS } = process.env;
export const inProduction = NODE_ENV === 'production';
export const inDevelopment = !NODE_ENV || NODE_ENV === 'development';
export const inTest = NODE_ENV === 'test';
export const inE2ETests = E2E_TESTS === 'true';

// Controller
export const CONTROLLER_ROUTES = 'CONTROLLER_ROUTES';
export const CONTROLLER_BASE_PATH = 'CONTROLLER_BASE_PATH';
