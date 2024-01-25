import { nanoid } from 'nanoid';
import { Service } from 'typedi';
import { Connection, Client } from '@temporalio/client';

import { logSampleWorkflow } from '@/temporal/workflows';
import { TASK_QUEUE_NAME } from '@/temporal/constants';

@Service()
export default class TemporalService {
  private client: Client;
  private clientPromise: Promise<Client>;

  constructor() {
    const connectionPromise = Connection.connect({ address: '172.18.32.14:7233' }); // Connect to localhost with default ConnectionOptions.
    // In production, pass options to the Connection constructor to configure TLS and other settings.
    // This is optional but we leave this here to remind you there is a gRPC connection being established.
    this.clientPromise = connectionPromise.then((connection) => {
      return (this.client = new Client({
        connection,
        // In production you will likely specify `namespace` here; it is 'default' if omitted
      }));
    });
  }

  async execute(req: any) {
    console.log('TemporalService.execute', req.body);

    const client = await this.clientPromise;
    // Invoke the `logSampleWorkflow` Workflow, only resolved when the workflow completes
    await client.workflow.execute(logSampleWorkflow, {
      taskQueue: TASK_QUEUE_NAME,
      workflowId: 'workflow-' + nanoid(),
    });

    return { hello: 'world' };
  }
}
