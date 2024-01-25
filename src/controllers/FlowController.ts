import { Service } from 'typedi';

import { Post, RestController } from '@/decorators';
import TemporalService from '@/services/TemporalService';

@Service()
@RestController('/flow')
export default class FlowController {
  constructor(private readonly temporalService: TemporalService) {}

  @Post('/run')
  async run(req: any) {
    const start = Date.now();
    console.log('info: [' + start + '] FlowController.run', req.body);
    this.temporalService.execute(req);
    const end = Date.now();
    console.log('info: [' + end + '] end duration[' + (end - start) + '] FlowController temporal execute');
    return { hello: 'world' };
  }
}
