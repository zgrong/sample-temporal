import { log, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { greet, copyObj, reverse } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
});

export async function logSampleWorkflow(): Promise<unknown> {
  const greeting = await greet('Temporal');

  let rev = '';
  if (true) {
    rev = await reverse('abcdefgllkjsdf');
  }

  const obj = await copyObj({ key: 'value', key2: 'value2' });
  console.info('logSampleWorkflow: Greeted ee3333', { greeting });
  return { greeting, obj, rev };
}
