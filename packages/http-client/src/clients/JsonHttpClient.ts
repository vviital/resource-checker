import { Readable } from 'stream';

import BaseClient from './base';

import { IHttpClientOptions, IHeaders } from '../interface';

const defaultOptions = {
  json: true,
  retry: 5,
  timeout: 60 * 1000,
};

class JsonHttpClient extends BaseClient {
  constructor(options?: IHttpClientOptions) {
    const _defaultOptions = { ...defaultOptions, ...(options || {}).defaultOptions };
    super({ ...options, defaultOptions: _defaultOptions });
  }

  async post(url: string, body: object|NodeJS.ReadableStream, headers: IHeaders = {}): Promise<any> {
    const isStream = body instanceof Readable;

    const response = await super.post(url, body, headers);

    if (!isStream) return response;

    let data: string = '';

    for await (const chunk of response) {
      data += chunk;
    }

    response.body = response.body || JSON.parse(data);

    return response;
  }
}

export default JsonHttpClient;
