import BaseClient from './base';

import { IHttpClientOptions } from '../interface';

const defaultOptions = {
  retry: 5,
  timeout: 60 * 1000,
};

class PlainHttpClient extends BaseClient {
  constructor(options?: IHttpClientOptions) {
    const _defaultOptions = { ...defaultOptions, ...(options || {}).defaultOptions };
    super(Object.assign({}, options, { defaultOptions: _defaultOptions }));
  }
}

export default PlainHttpClient;
