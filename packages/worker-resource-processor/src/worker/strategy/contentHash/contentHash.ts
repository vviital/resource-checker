import { createHash } from 'crypto';

import { IConfiguration } from '@resource-checker/configurations';
import { PlainHttpClient } from '@resource-checker/http-client';
import { ErrorObject } from '@resource-checker/base';

import BaseStrategy, { StrategyBaseOptions } from '../base';
import { stringToStream } from '../../../utils';
import { DefaultContentHashComparator } from './comparator';

export type ContentHashRevision = {
  hash: string,
  statusCode: number,
};

const isBuffer = (x: string | Buffer): x is Buffer => {
  return x instanceof Buffer;
};

class ContentHashStrategy extends BaseStrategy {
  private client: PlainHttpClient;

  constructor(config: IConfiguration, options: StrategyBaseOptions) {
    const opts = { ...options, type: ContentHashStrategy.name };
    super(config, opts);

    this.client = new PlainHttpClient();

    this.comparators.push(new DefaultContentHashComparator());
  }

  private async createHash(string: string): Promise<string> {
    const hash: string = await new Promise((resolve, reject) => {
      const stream = stringToStream(string);

      const hash = createHash('sha256');

      stream
        .pipe(hash)
        .on('finish', () => {
          try {
            const data = hash.read();

            if (isBuffer(data)) {
              return resolve(data.toString('hex'));
            }
  
            resolve(data);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    }).then(x => x as string);

    return hash;
  }

  protected async createRevision(url: string) {
    try {
      const { body, statusCode } = await this.client.get(url);

      const hash = await this.createHash(body);
  
      return this.createRevisionObject({ hash, statusCode });
    } catch (error) {
      return new ErrorObject(error && error.message, { source: ContentHashStrategy.name, stack: error.stack });
    }
  }
}

export default ContentHashStrategy;
