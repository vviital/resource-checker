import config, { IConfiguration } from '@resource-checker/configurations';

import RedirectStrategy from './strategy/redirect/redirect';
import ContentHashStrategy from './strategy/contentHash/contentHash';
import ScreenShotStrategy from './strategy/screenshot/screenshot';
import { IStrategy } from './strategy/base/base';
import { externalClients } from '@resource-checker/base';

import CronWorker, { ICronConfig } from '../cron';

class ResourceChecker extends CronWorker {
  subscriptions: externalClients.Subscriptions;

  constructor(config: IConfiguration, options: ICronConfig) {
    super(config, options);
    this.subscriptions = new externalClients.Subscriptions(this.config);
  }

  public async operation(): Promise<object|void> {
    for await (const subscription of this.subscriptions) {
      const { url, revisions } = subscription;

      const strategy1: IStrategy = new RedirectStrategy(config, { revisions });
      const strategy2: IStrategy = new ContentHashStrategy(config, { revisions });
      const strategy3: IStrategy = new ScreenShotStrategy(config, { revisions });

      const res = await Promise.all([
        strategy1.handle(url),
        strategy2.handle(url),
        strategy3.handle(url),
      ]);

      console.log('res', res);
    }
  }
}

export default ResourceChecker;
