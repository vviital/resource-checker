import RedirectStrategy from './strategy/redirect/redirect';
import ContentHashStrategy from './strategy/contentHash/contentHash';
import ScreenShotStrategy from './strategy/screenshot/screenshot';
import { IStrategy } from './strategy/base/base';
import config from '@resource-checker/configurations';

import CronWorker, { ICronConfig } from '../cron';

const subscriptionsIterator = () => {

};

const SubscriptionCollection = {
  [Symbol.asyncIterator]: () => subscriptionsIterator,
}

class ResourceChecker extends CronWorker {
  private schema: {
    strategy: IStrategy,
  }[];

  constructor(config: ICronConfig) {
    super(config);
  }

  private getNextSubscription() {

  }

  public async operation(): Promise<object|void> {
    const strategy1 = new RedirectStrategy(config, { revisions: [] });
    const strategy2 = new ContentHashStrategy(config, { revisions: [] });
    const strategy3 = new ScreenShotStrategy(config, { revisions: [] });

    // const url = 'https://ww1.read7deadlysins.com/chapter/nanatsu-no-taizai-spoilers-raw-chapter-292/';
    const url = 'https://ww1.read7deadlysins.com/chapter/nanatsu-no-taizai-chapter-292/';

    const res = await Promise.all([
      strategy1.handle(url),
      strategy2.handle(url),
      strategy3.handle(url),
    ]);
  }
}

export default ResourceChecker;
