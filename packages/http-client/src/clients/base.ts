import * as got from 'got';
import { Readable } from 'stream';

import {
  IHeaders,
  IHttpClient,
  IHttpClientOptions,
  IHttpClientResponse,
} from '../interface';

abstract class BaseClient implements IHttpClient {
  protected defaultOptions: {
    cache?: any,
  };

  constructor(protected options: IHttpClientOptions) {
    this.defaultOptions = options.defaultOptions || {};
  }

  get(url: string): Promise<IHttpClientResponse> {
    const opts = { ...this.options.defaultOptions, method: 'GET' };
    return got(url, opts) as Promise<IHttpClientResponse>;
  }

  async _handleStream(response: IHttpClientResponse & any) {
    let result = '';

    for await (const chunk of response) {
      result += chunk;
    }

    response.body = result;
  }

  post(url: string, body: object|NodeJS.ReadableStream, headers: IHeaders = {}): Promise<IHttpClientResponse> {
    const opts: { [key: string]: any, json: true } = { ...this.options.defaultOptions, method: 'POST', body, json: true };

    if (body instanceof Readable) {
      return new Promise((resolve, reject) => {
        const uploadStream = got
          .stream
          .post(url, { ...this.options.defaultOptions, headers })
          .on('response', async (response: any) => {
            await this._handleStream(response);

            resolve(response);
          })
          .on('error', reject);

        body.pipe(uploadStream);
      });
    }
  
    return got(url, opts) as Promise<IHttpClientResponse>;
  }

  patch(url: string, body: object): Promise<IHttpClientResponse> {
    const opts: { json: true, [key: string]: any } = { ...this.options.defaultOptions, method: 'PATCH', body, json: true };
    return got(url, opts) as Promise<IHttpClientResponse>;
  }

  delete(url: string): Promise<IHttpClientResponse> {
    const opts = { ...this.options.defaultOptions, method: 'DELETE' };
    return got(url, opts) as Promise<IHttpClientResponse>;
  }
}

export default BaseClient;
