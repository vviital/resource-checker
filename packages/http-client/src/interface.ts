export interface IHttpClient {
  get(url: string, qs?: Object): Promise<Object>;
  post(url: string, body: Object): Promise<Object>;
  delete(url: string): Promise<Object>;
  patch(url: string, body: Object): Promise<Object>;
}

export interface IHttpClientOptions {
  cache?: {
    url: string,
  },
  defaultOptions?: {
    [key: string]: Object|number|string;
  },
}
