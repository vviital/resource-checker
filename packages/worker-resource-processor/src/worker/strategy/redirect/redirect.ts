import { PlainHttpClient } from '@resource-checker/http-client';
import { ErrorObject } from '@resource-checker/base';
import { isEmpty } from 'lodash';

import BaseStrategy, { StrategyBaseOptions } from '../base/base';
import { IConfiguration } from '@resource-checker/configurations';
import { DefaultRedirectComparator } from './comparator';


class RedirectStrategy extends BaseStrategy {
  private client: PlainHttpClient;

  constructor(config: IConfiguration, options: StrategyBaseOptions) {
    const opts = { ...options, type: RedirectStrategy.name };
    super(config, opts);

    this.client = new PlainHttpClient();
    this.comparators.push(new DefaultRedirectComparator());
  }

  protected async createRevision(url: string) {
    try {
      const { redirectUrls, statusCode } = await this.client.get(url);

      return this.createRevisionObject({
        hasRedirect: Array.isArray(redirectUrls) && !isEmpty(redirectUrls),
        redirectUrls,
        statusCode,
      });
    } catch (error) {
      return new ErrorObject(error.message, {  source: RedirectStrategy.name, stack: error.stack });
    }
  }
}

export default RedirectStrategy;
