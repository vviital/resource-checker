import { IConfiguration } from '@resource-checker/configurations';
import { Chrome } from '../../../clients';
import { externalClients, ErrorObject } from '@resource-checker/base';

import BaseStrategy, { StrategyBaseOptions } from '../base';
import { DefaultScreenshotComparator, PixelScreenshotComparator } from './comparator';

class ScreenshotStrategy extends BaseStrategy {
  private client: Chrome;
  private fileStorage: externalClients.FileStorage;

  constructor(config: IConfiguration, options: StrategyBaseOptions) {
    const opts = { ...options, type: ScreenshotStrategy.name };
    super(config, opts);

    this.fileStorage = new externalClients.FileStorage(config);
    this.client = new Chrome({ maxPages: 5, externalFSDriver: this.fileStorage });
    this.comparators.push(new DefaultScreenshotComparator());
    this.comparators.push(new PixelScreenshotComparator());
  }

  private async initialize() {
    const result = await this.client.initialize();

    if (result instanceof ErrorObject) {
      console.log(result);
    }
  }

  protected async createRevision(url: string) {
    try {
      await this.initialize();

      const page = await this.client.core.newPage();

      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, { timeout: 60000 });

      const fileIdOrError = await this.client.savePage(page);

      await page.close();

      return this.createRevisionObject({ fileId: fileIdOrError });
    } catch (error) {
      return new ErrorObject(error.message, {  source: ScreenshotStrategy.name, stack: error.stack });
    }
  }
}

export default ScreenshotStrategy;
