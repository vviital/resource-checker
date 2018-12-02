import * as got from 'got';
import { Readable } from 'stream';

import { IHttpClient, IHttpClientOptions, IHeaders } from '../interface';

abstract class BaseClient implements IHttpClient {
  protected defaultOptions: {
    cache?: any,
  };

  constructor(protected options: IHttpClientOptions) {
    this.defaultOptions = options.defaultOptions || {};
  }

  get(url: string): Promise<any> {
    const opts = { ...this.options.defaultOptions, method: 'GET' };
    return got(url, opts);
  }

  post(url: string, body: object|NodeJS.ReadableStream, headers: IHeaders = {}): Promise<any> {
    const opts: { [key: string]: any, json: true } = { ...this.options.defaultOptions, method: 'POST', body, json: true };

    if (body instanceof Readable) {
      return new Promise((resolve, reject) => {
        const uploadStream = got
          .stream
          .post(url, { ...this.options.defaultOptions, headers })
          .on('response', resolve)
          .on('error', reject);

        body.pipe(uploadStream);
      });
    }
  
    return got(url, opts);
  }

  patch(url: string, body: object): Promise<any> {
    const opts: { json: true, [key: string]: any } = { ...this.options.defaultOptions, method: 'PATCH', body, json: true };
    return got(url, opts);
  }

  delete(url: string): Promise<any> {
    const opts = { ...this.options.defaultOptions, method: 'DELETE' };
    return got(url, opts);
  }
}

export default BaseClient;
