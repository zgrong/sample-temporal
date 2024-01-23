import type { SchemaObj } from 'convict';

export const ensureStringArray = (values: string[], { env }: SchemaObj<string>) => {
  if (!env) throw new Error('Missing env');

  if (!Array.isArray(values)) throw new Error(env);

  for (const value of values) {
    if (typeof value !== 'string') throw new Error(env);
  }
};
