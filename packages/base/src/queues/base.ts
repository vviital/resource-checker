import * as amqp from 'amqplib';
import { IConfiguration } from '@resource-checker/configurations';

import { Exchange, Queue } from './models';
import {
  BasePubSubOptions,
  IConnectable,
  IPubSub,
  PubSubCallback,
  SubscribtionDescriptor,
} from './declarations';

import { connected } from './helpers';

const delay = (timeout: number) => new Promise(r => setTimeout(r, timeout));

async function retry<T>(fn: () => Promise<T>, times: number): Promise<T> {
  try {
    const result = await fn();
    return result;
  } catch (error) {
    if (!times) {
      throw new Error(error)
    }
    await delay(10 * 1000);
    return retry(fn, times - 1);
  }
}

abstract class PubSub implements IPubSub, IConnectable {
  protected static _connection: amqp.Connection|null;
  protected static promiseToConnection: Promise<amqp.Connection>|null;
  protected bindings: {
    queues: Set<string>,
    exchanges: Set<string>,
  };
  protected exchange: Exchange;
  protected isConfigured: boolean;

  protected channel: amqp.Channel|null;
  private promiseToChannel: Promise<amqp.Channel>|null;

  private shouldClose: boolean;
  private static shouldDestroy: boolean;

  constructor(protected config: IConfiguration, protected options: BasePubSubOptions) {
    this.bindings = { queues: new Set(), exchanges: new Set() };

    this.options.prefetchCount = this.options.prefetchCount || 10;
  }

  static set connection(connection: amqp.Connection) {
    PubSub._connection = connection;
  }

  static get connection() {
    if (PubSub._connection) return PubSub._connection;
    throw new Error('Connection is not set');
  }

  static get connected() {
    return !!this._connection && !this.promiseToConnection;
  }

  static set connected(value: boolean) {
    if (!value) {
      PubSub._connection = null;
      PubSub.promiseToConnection = null;
    }
  }

  protected async configureExchange(exchange: Exchange = this.exchange) {
    const channel = await this.getChannel();

    if (this.exchange !== exchange || !this.isConfigured) {
      const { name, type, options } = exchange;
      await channel.assertExchange(name, type, options);
      
      if (this.exchange === exchange) this.isConfigured = true;
    }
  }

  private async bindQueueToExchange(queue: Queue, pattern?: string) {
    await this.configureExchange();
    const channel = await this.getChannel();

    if (!pattern) {
      pattern = queue.name;
    }

    if (!this.bindings.queues.has(queue.name)) {
      await channel.assertQueue(queue.name, queue.options);
      await channel.bindQueue(queue.name, this.exchange.name, pattern);
      this.bindings.queues.add(queue.name);
    }
  }

  private async bindExchangeToExchange(exchange: Exchange, pattern?: string) {
    await this.configureExchange();
    const channel = await this.getChannel();

    if (!pattern) {
      pattern = exchange.name;
    }

    if (this.bindings.exchanges.has(exchange.name)) {
      await this.configureExchange(exchange);
      await channel.bindExchange(exchange.name, this.exchange.name, pattern);
      this.bindings.exchanges.add(exchange.name);
    }
  }

  async bind(exchageOrQueue: Exchange|Queue, pattern?: string) {
    if (Queue.isQueue(exchageOrQueue)) {
      return this.bindQueueToExchange(exchageOrQueue, pattern);
    }
    return this.bindExchangeToExchange(exchageOrQueue, pattern);
  }

  async connect() {
    if (PubSub.connected) return;

    if (PubSub.promiseToConnection) {
      await PubSub.promiseToConnection;
    } else {
      const url = `amqp://${this.config.get('rabbitmqHost')}`;
      console.log(`--- connection to ${url} ---`);
      PubSub.promiseToConnection = retry(() => Promise.resolve(amqp.connect(url)), 3);
      PubSub.connection = await PubSub.promiseToConnection;
      console.log(`--- connection ${url} was established---`);
    }

    PubSub.promiseToConnection = null;

    process.once('SIGINT', this.close.bind(this));

    PubSub.connection.on('error', (error) => console.error('RabbitMQPubSub', error));
    PubSub.connection.on('close', async () => {
      console.log('--- connection was closed ---');
      if (PubSub.shouldDestroy) return;

      console.log('connection was closed. Trying to reconnect');
      try {
        console.log(`${this.className}::reconnecting`);
        PubSub.connected = false;
        await this.connect();  
      } catch (err) {
        console.error(err);
      }
    });
  }

  @connected()
  async getChannel() {
    if (this.channel && !this.promiseToChannel) return this.channel;

    if (this.promiseToChannel) {
      return this.promiseToChannel;
    } else {
      this.promiseToChannel = PubSub.connection.createChannel() as unknown as Promise<amqp.Channel>;
      this.channel = await this.promiseToChannel;
    }

    this.promiseToChannel = null;
    this.channel.prefetch(this.options.prefetchCount);

    this.channel.on('error', async (error) => console.error('RabbitMQPubSub', error));
    this.channel.on('close', async () => {
      if (PubSub.shouldDestroy || this.shouldClose) return;

      console.log('channel was closed. Trying to reopen');
      try {
        this.promiseToChannel = null;
        this.channel = null;

        await this.getChannel();
      } catch (err) {
        console.error(err);
      }
    });

    return this.channel;
  }

  async publish(message: object, route: string, implicitBinding: boolean = true): Promise<void> {
    if (implicitBinding) {
      await this.bind(new Queue(route));
    }

    const channel = await this.getChannel();

    const content = JSON.stringify(message);
    const options = { persistent: true };

    const publish = () => channel.publish(this.exchange.name, route, Buffer.from(content), options)

    const result = publish();

    if (!result) {
      channel.on('drain', publish);
    }
  }

  async subscribe(route: string, callback: PubSubCallback, implicitBinding: boolean = true): Promise<SubscribtionDescriptor> {
    if (implicitBinding) {
      await this.bind(new Queue(route));
    }

    const channel = await this.getChannel();

    const options = {
      noAck: false,
      noLocal: true,
    };

    const onMessage = (message: amqp.ConsumeMessage|null) => {
      if (!message) return;

      process.nextTick(async () => {
        try {
          const content = JSON.parse(message.content.toString());
          await callback(content);
          channel.ack(message);
        } catch (error) {
          console.error(`${this.className}::error`, error);
        }
      });
    };

    const promise = channel.consume(route, onMessage, options);

    return {
      async unsubscribe() {
        const subscription = await promise;
        await channel.cancel(subscription.consumerTag);
      }
    }
  }

  async close() {
    this.shouldClose = true;
    if (this.channel) {
      await this.channel.close();
    }
  }

  async destroy() {
    PubSub.shouldDestroy = true;
    await this.close();
    await PubSub.destroy();
  }

  static async destroy() {
    PubSub.shouldDestroy = true;
    if (PubSub.connected) {
      await PubSub.connection.close();
    };  
  }

  get className() {
    return PubSub.name;
  }
}

export default PubSub;

export {
  Exchange,
  Queue,
};
