import { PlainHttpClient } from '@resource-checker/http-client';
import { ErrorObject } from '@resource-checker/base';
import { isEmpty } from 'lodash';

import BaseStrategy, { IStrategyBaseOptions } from '../base/base';
import { IConfiguration } from '@resource-checker/configurations';

class RedirectStrategy extends BaseStrategy {
  private client: PlainHttpClient;

  constructor(config: IConfiguration, options: IStrategyBaseOptions) {
    const opts = { ...options, type: RedirectStrategy.name };
    super(config, opts);

    this.client = new PlainHttpClient();
  }

  private async createRevision(url: string): Promise<object | ErrorObject> {
    try {
      const { redirectUrls, statusCode } = await this.client.get(url);

      return {
        hasRedirect: Array.isArray(redirectUrls) && !isEmpty(redirectUrls),
        redirectUrls,
        statusCode,
      };
    } catch (error) {
      return new ErrorObject(error.message, {  source: RedirectStrategy.name, stack: error.stack });
    }
  }

  async handle(url: string) {
    const next = await this.createRevision(url);

    if (next instanceof ErrorObject) return next;

    return this.formatResponse(next);
  }
}

export default RedirectStrategy;
