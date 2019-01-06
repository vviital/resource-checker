import { IConfiguration } from '@resource-checker/configurations';

import StrategyManager from './strategy';
import { externalClients } from '@resource-checker/base';

import CronWorker, { ICronConfig } from '../cron';

class ResourceChecker extends CronWorker {
  subscriptions: externalClients.Subscriptions;
  strategyManager: StrategyManager;

  constructor(config: IConfiguration, options: ICronConfig) {
    super(config, options);
    this.subscriptions = new externalClients.Subscriptions(this.config);
    this.strategyManager = new StrategyManager(this.config);
  }

  public async operation(): Promise<object|void> {
    for await (const subscription of this.subscriptions) {
      const { url, revisions } = subscription;

      const strategies = this.strategyManager.getStrategies(subscription.handlerTypes, { revisions });

      const res = await Promise.all(strategies.map(strategy => strategy.handle(url)));

      console.log('res', res);
    }
  }
}

export default ResourceChecker;
