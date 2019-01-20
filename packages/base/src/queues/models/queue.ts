import * as amqp from 'amqplib';

export default class Queue {
  constructor(public name: string, public options: amqp.Options.AssertQueue = {}) {
    this.options.durable = this.options.durable === false ? false : true;
  }

  static isQueue(object: any): object is Queue {
    return object instanceof Queue;
  }
}
