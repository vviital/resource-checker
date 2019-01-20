import { IConfiguration } from '@resource-checker/configurations';
import { Chrome } from '../../../clients';
import { externalClients, ErrorObject } from '@resource-checker/base';

import BaseStrategy, { IProcessorResult, IStrategyBaseOptions } from '../base';

class ScreenshotStrategy extends BaseStrategy {
  private client: Chrome;
  private fileStorage: externalClients.FileStorage;

  constructor(config: IConfiguration, options: IStrategyBaseOptions) {
    const opts = { ...options, type: ScreenshotStrategy.name };
    super(config, opts);

    this.fileStorage = new externalClients.FileStorage(config);
    this.client = new Chrome({ maxPages: 5, externalFSDriver: this.fileStorage });
  }

  private async initialize() {
    const result = await this.client.initialize();

    if (result instanceof ErrorObject) {
      console.log(result);
    }
  }

  async handle(url: string): Promise<IProcessorResult|ErrorObject> {
    await this.initialize();

    const page = await this.client.core.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(url, { timeout: 60000 });

    const fileIdOrError = await this.client.savePage(page);

    await page.close();

    if (fileIdOrError instanceof ErrorObject) return fileIdOrError;

    return this.formatResponse({ fileId: fileIdOrError });
  }
}

export default ScreenshotStrategy;
