import { IConfiguration } from '@resource-checker/configurations';

import BasePubSub from './base';
import { Exchange } from './models';
import { BasePubSubOptions } from './declarations';

export default class DirectPubSub extends BasePubSub {
  constructor(config: IConfiguration, options: BasePubSubOptions) {
    super(config, options);

    if (!options.exchange) {
      throw new Error('DirectPubSub::Please provide exchange');
    }

    this.exchange = new Exchange(`direct_${options.exchange}`, 'direct', {
      durable: true,
      alternateExchange: 'amq.direct',
    });
  }

  get className() {
    return DirectPubSub.name;
  }
}
