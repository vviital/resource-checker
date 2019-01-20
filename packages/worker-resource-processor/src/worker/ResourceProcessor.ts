import { IConfiguration } from '@resource-checker/configurations';
import { queues } from '@resource-checker/base';

import StrategyManager from './strategy';
import { ISubscriptionObject } from '@resource-checker/base/dest/clients/subscriptions';

class ResourceProcessor {
  private exchange: queues.Exchange;
  private subscriber: queues.Direct;
  private subscribtionDescriptor: queues.SubscribtionDescriptor;
  private strategyManager: StrategyManager;
  
  constructor(protected config: IConfiguration) {
    this.exchange = new queues.Exchange(config.get('resourceProcessingExchange'), 'direct');
    this.strategyManager = new StrategyManager(this.config);
  }

  async process(subscription: ISubscriptionObject) {
    const { url, revisions } = subscription;

    console.log(`processing ${url}`);

    const strategies = this.strategyManager.getStrategies(subscription.handlerTypes, { revisions });

    const res = await Promise.all(strategies.map(strategy => strategy.handle(url)));

    console.log(`processing finished for ${url}`, res);
  }

  async initialize() {
    const options = {
      exchange: this.exchange.name,
      prefetchCount: +this.config.get('resourceProcessingConcurrency') || 1,
    };
    const route = this.config.get('resourceProcessingRoute');

    this.subscriber = new queues.Direct(this.config, options)
    this.subscribtionDescriptor = await this.subscriber.subscribe(route, this.process.bind(this), false);
  }

  async close() {
    await this.subscribtionDescriptor.unsubscribe();
    await this.subscriber.destroy();
  }
}

export default ResourceProcessor;

