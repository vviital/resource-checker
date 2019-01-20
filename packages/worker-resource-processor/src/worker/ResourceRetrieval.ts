import { IConfiguration } from '@resource-checker/configurations';

import { externalClients, queues } from '@resource-checker/base';

import CronWorker, { ICronConfig } from '../cron';
class ResourceChecker extends CronWorker {
  private subscriptions: externalClients.Subscriptions;
  private publisher: queues.Direct;

  constructor(config: IConfiguration, options: ICronConfig) {
    super(config, options);
    this.subscriptions = new externalClients.Subscriptions(this.config);
    this.publisher = new queues.Direct(this.config, {
      exchange: config.get('resourceProcessingExchange'),
      prefetchCount: 1,
    });
  }

  public async operation(): Promise<object|void> {
    for await (const subscription of this.subscriptions) {
      const route = this.config.get('resourceProcessingRoute');
      await this.publisher.publish(subscription, route);
    }
  }
}

export default ResourceChecker;
