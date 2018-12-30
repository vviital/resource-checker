import { IConfiguration } from '@resource-checker/configurations';
import { Chrome, FileStorageClient, ICreationStatus } from '../../../clients';

import BaseStrategy, { IProcessorResult, IStrategyBaseOptions } from '../base';
import { ErrorObject } from '../../../../../base/dest';

class ScreenshotStrategy extends BaseStrategy {
  private client: Chrome;
  private fileStorage: FileStorageClient;

  constructor(config: IConfiguration, options: IStrategyBaseOptions) {
    const opts = { ...options, type: ScreenshotStrategy.name };
    super(config, opts);

    this.fileStorage = new FileStorageClient(config);
    this.client = new Chrome();
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

    const descriptor = await this.client.savePage(page);

    const file = await this.fileStorage.save(descriptor.filename, descriptor.createStream());

    await descriptor.delete();

    await page.close();

    if (file instanceof ErrorObject) return file;

    return this.formatResponse({ fileId: (file as ICreationStatus).id });
  }
}

export default ScreenshotStrategy;
