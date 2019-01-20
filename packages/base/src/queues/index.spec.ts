import { orderBy, times } from 'lodash';
import DirectPubSub from './direct';
import FanoutPubSub from './fanout';
import BasePubSub from './base';

const config = {
  get(key: string) {
    const map: { [key: string]: string } = {
      rabbitmqHost: 'rabbitmq',
    };

    return map[key] || '';
  }
}

const enchanceDone = (done: Function, count: number, expectation?: Function) => {
  let counter: number = 0;
  return (...args: any[]) => {
    if (args && args.length) done(...args);
    counter++;
    if (counter === count) {
      if (expectation) expectation();
      done(...args);
    }
  };
}

describe('RabbitMQPubSub', () => {
  const promisify = (fn: Function, ...args: any) => new Promise((resolve) => {
    fn(...args, resolve);
  });

  let instances: BasePubSub[] = [];
  afterEach(async () => {
    for (const instance of instances) {
      await instance.close();
    }
    instances = [];
  });
  
  afterAll(async () => {
    await DirectPubSub.destroy();
  });

  describe('DirectPubSub', () => {
    it('should be received by single subscriber', async () => {
      const options = { prefetchCount: 1, exchange: 'test-exchange' };
      const publisher = new DirectPubSub(config, options);
      const consumer = new DirectPubSub(config, options);

      instances.push(publisher);
      instances.push(consumer);

      await publisher.publish({ value: 'test message' }, 'test-route');

      const result = await promisify(consumer.subscribe.bind(consumer), 'test-route');

      expect(result).toEqual({ value: 'test message' });
    });

    it('should spread messages via round-robin', async (_done) => {
      const options = { prefetchCount: 1, exchange: 'test-exchange' };
      const publisher = new DirectPubSub(config, options);
      const consumer1 = new DirectPubSub(config, options);
      const consumer2 = new DirectPubSub(config, options);

      instances.push(publisher);
      instances.push(consumer1);
      instances.push(consumer2);

      const messages: object[] = [];

      await Promise.all([
        publisher.publish({ value: 'test message 1' }, 'test-route'),
        publisher.publish({ value: 'test message 2' }, 'test-route'),
      ]);

      const done = enchanceDone(_done, 2, () => {
        const orderedMessages = orderBy(messages, 'value');
        expect(orderedMessages).toEqual([
          { value: 'test message 1' },
          { value: 'test message 2' },
        ]);
      });

      const callback = (message: object) => {
        messages.push(message);
        done();
      }
      
      consumer1.subscribe('test-route', callback);
      consumer2.subscribe('test-route', callback);
    });
    
    it('should cancel subscription', async (_done) => {
      const count = 100;
      const options = { prefetchCount: 1, exchange: 'test-exchange' };
      const publisher = new DirectPubSub(config, options);
      const consumer1 = new DirectPubSub(config, options);
      const consumer2 = new DirectPubSub(config, options);

      instances.push(publisher);
      instances.push(consumer1);
      instances.push(consumer2);

      const consumer1Messages: object[] = [];
      const consumer2Messages: object[] = [];
      let subscriptions: any = {};

      await Promise.all(times(count, () => publisher.publish({ value: 'test message' }, 'test-route')));

      const done = enchanceDone(_done, count, () => {
        expect(consumer1Messages.length).toEqual(99);
        expect(consumer2Messages.length).toEqual(1);
      });
      
      consumer1.subscribe('test-route', (message: object) => {
        consumer1Messages.push(message);
        done();
      });
      subscriptions.consumer2 = await consumer2.subscribe('test-route', async (message: object) => {
        consumer2Messages.push(message);
        await subscriptions.consumer2.unsubscribe();
        done();
      });
    });
  });

  describe('FanoutPubSub', () => {
    it('should send messages to all consumers', async (_done) => {
      const count = 100;
      const options = { prefetchCount: 1, exchange: 'test-exchange' };
      const publisher = new FanoutPubSub(config, options);
      const consumer1 = new FanoutPubSub(config, options);
      const consumer2 = new FanoutPubSub(config, options);
      const consumer3 = new FanoutPubSub(config, options);

      const messages: any = {};

      instances.push(publisher);
      instances.push(consumer1);
      instances.push(consumer2);
      instances.push(consumer3);

      const done = enchanceDone(_done, count * 3, () => {
        expect(messages.consumer1.length).toEqual(100);
        expect(messages.consumer2.length).toEqual(100);
        expect(messages.consumer3.length).toEqual(100);
      });

      const genericCallback = (key: string) => (message: object) => {
        messages[key] = messages[key] || [];
        messages[key].push(message);
        done();
      }

      await Promise.all([
        consumer1.subscribe('test-route', genericCallback('consumer1')),
        consumer2.subscribe('test-route', genericCallback('consumer2')),
        consumer3.subscribe('test-route', genericCallback('consumer3')),
      ]);

      await Promise.all(times(count, () => publisher.publish({ value: 'test message' }, 'test-route')));
    });
  });
});
