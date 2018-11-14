import * as got from 'got';

// import KeyvRedis from '@keyv/redis';

import { IHttpClient, IHttpClientOptions } from '../interface';

abstract class BaseClient implements IHttpClient {
  // protected cache: KeyvRedis;
  protected client: object;
  protected defaultOptions: {
    // cache?: KeyvRedis,
  };

  constructor(protected options: IHttpClientOptions) {
    this.defaultOptions = options.defaultOptions || {};
  
    if (options.cache) {
      // this.cache = new KeyvRedis(options.cache.url);
      // this.defaultOptions.cache = this.cache;
    }
  }

  get(url: string) {
    const opts = { ...this.options.defaultOptions, method: 'GET' };
    return got(url, opts);
  }

  post(url: string, body: object) {
    const opts: { [key: string]: any, json: true } = { ...this.options.defaultOptions, method: 'POST', body, json: true };
    return got(url, opts);
  }

  patch(url: string, body: object) {
    const opts: { json: true, [key: string]: any } = { ...this.options.defaultOptions, method: 'PATCH', body, json: true };
    return got(url, opts);
  }

  delete(url: string) {
    const opts = { ...this.options.defaultOptions, method: 'DELETE' };
    return got(url, opts);
  }
}

export default BaseClient;
