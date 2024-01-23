import convict from 'convict';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

import { inTest, inE2ETests } from '@/constants';

if (inE2ETests) {
  // Skip loading config from env variables in end-to-end tests
  process.env.EXECUTIONS_PROCESS = 'main';
  process.env.N8N_DIAGNOSTICS_ENABLED = 'false';
  process.env.N8N_PUBLIC_API_DISABLED = 'true';
  process.env.EXTERNAL_FRONTEND_HOOKS_URLS = '';
  process.env.N8N_PERSONALIZATION_ENABLED = 'false';
  process.env.N8N_AI_ENABLED = 'true';
} else if (inTest) {
  process.env.N8N_LOG_LEVEL = 'silent';
  process.env.N8N_ENCRYPTION_KEY = 'test-encryption-key';
  process.env.N8N_PUBLIC_API_DISABLED = 'true';
  process.env.SKIP_STATISTICS_EVENTS = 'true';
} else {
  dotenv.config();
}

// Load schema after process.env has been overwritten
import { schema } from './schema';
const config = convict(schema, { args: [] });

// Load overwrites when not in tests
if (!inE2ETests && !inTest) {
  // Overwrite default configuration with settings which got defined in
  // optional configuration files
  const { N8N_CONFIG_FILES } = process.env;
  if (N8N_CONFIG_FILES !== undefined) {
    const configFiles = N8N_CONFIG_FILES.split(',');
    console.debug('Loading config overwrites', configFiles);
    config.loadFile(configFiles);
  }

  // Overwrite config from files defined in "_FILE" environment variables
  Object.entries(process.env).forEach(([envName, fileName]) => {
    if (envName.endsWith('_FILE') && fileName) {
      const configEnvName = envName.replace(/_FILE$/, '');
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const key = config._env[configEnvName]?.[0] as string;
      if (key) {
        let value: string;
        try {
          value = readFileSync(fileName, 'utf8');
        } catch (error: any) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (error.code === 'ENOENT') {
            throw new Error('File not found');
          }
          throw error;
        }
        config.set(key, value);
      }
    }
  });
}

config.validate({
  allowed: 'strict',
});

export default config;
