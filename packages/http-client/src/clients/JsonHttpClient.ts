import { Readable } from 'stream';

import BaseClient from './base';

import { IHttpClientOptions, IHeaders, IHttpClientResponse } from '../interface';

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

  async post(url: string, body: object|NodeJS.ReadableStream, headers: IHeaders = {}): Promise<IHttpClientResponse> {
    const isStream = body instanceof Readable;

    const response = await super.post(url, body, headers);

    if (!isStream) return response;

    response.body = JSON.parse(response.body);

    return response;
  }
}

export default JsonHttpClient;
