import Container, { Service } from 'typedi';

import { Delete, Get, Patch, Post, Put, RestController } from '@/decorators';

@Service()
@RestController('/flow')
export default class FlowController {
  @Post('/run')
  async run(req: any) {
    console.log('FlowController.run', req.body);

    return { hello: 'world' };
  }
}
