export interface IHttpClient {
  get(url: string, qs?: object): Promise<object>;
  post(url: string, body: object): Promise<object>;
  delete(url: string): Promise<object>;
  patch(url: string, body: object): Promise<object>;
}

export interface IHttpClientOptions {
  cache?: {
    url: string,
  },
  defaultOptions?: {
    [key: string]: object|number|string|boolean;
  },
}

export interface IHeaders {
  [key: string]: string;
}
