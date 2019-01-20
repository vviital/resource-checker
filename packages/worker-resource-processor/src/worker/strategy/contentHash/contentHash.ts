import { createHash } from 'crypto';

import { IConfiguration } from '@resource-checker/configurations';
import { PlainHttpClient } from '@resource-checker/http-client';
import { ErrorObject } from '@resource-checker/base';

import BaseStrategy, { IStrategyBaseOptions, IProcessorResult } from '../base';
import { stringToStream } from '../../../utils';

interface IContentHashRevision {
  hash: string,
  statusCode: number,
};

const isBuffer = (x: string | Buffer): x is Buffer => {
  return x instanceof Buffer;
};

class ContentHashStrategy extends BaseStrategy {
  private client: PlainHttpClient;

  constructor(config: IConfiguration, options: IStrategyBaseOptions) {
    const opts = { ...options, type: ContentHashStrategy.name };
    super(config, opts);

    this.client = new PlainHttpClient();
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

  private async createRevision(url: string): Promise<IContentHashRevision | ErrorObject> {
    try {
      const { body, statusCode } = await this.client.get(url);

      const hash = await this.createHash(body);
  
      return { hash, statusCode };
    } catch (error) {
      return new ErrorObject(error && error.message, { source: ContentHashStrategy.name, stack: error.stack });
    }
  }

  async handle(url: string): Promise<IProcessorResult | ErrorObject> {
    const next = await this.createRevision(url);

    if (next instanceof ErrorObject) return next;

    return this.formatResponse(next);
  }
}

export default ContentHashStrategy;
