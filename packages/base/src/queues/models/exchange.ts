import * as amqp from 'amqplib';

import { ExchangeType } from '../declarations';

export default class Exchange {
  constructor(public name: string, public type: ExchangeType, public options: amqp.Options.AssertExchange = {}) {
    this.options.durable = this.options.durable === false ? false : true;
  }

  static isExchange(object: any): object is Exchange {
    return object instanceof Exchange;
  }
}