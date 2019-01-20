import { IConfiguration } from '@resource-checker/configurations';
import * as shortId from 'shortid';

import BasePubSub from './base';
import { Exchange, Queue } from './models';
import { BasePubSubOptions, PubSubCallback } from './declarations';

const ONE_HOUR = 60 * 60 * 1000;

export default class FanoutPubSub extends BasePubSub {
  constructor(config: IConfiguration, options: BasePubSubOptions) {
    super(config, options);

    if (!options.exchange) {
      throw new Error(`${this.className}::Please provide exchange`);
    }

    this.exchange = new Exchange(`fanout_${options.exchange}`, 'fanout', {
      durable: true,
      alternateExchange: 'amq.fanout',
    });
  }

  get className() {
    return FanoutPubSub.name;
  }

  publish(message: object, route: string) {
    return super.publish(message, route, false);
  }

  async subscribe(route: string, callback: PubSubCallback) {
    const queue = `${route}_${shortId.generate()}`;
    await this.bind(new Queue(queue, { autoDelete: true, expires: ONE_HOUR }), route);

    return super.subscribe(queue, callback, false);
  }
}
