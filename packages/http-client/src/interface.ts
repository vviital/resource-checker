export interface IHttpClientResponse {
  body: any,
  redirectUrls: string[],
  statusCode: number,
}

export interface IHttpClient {
  get(url: string, qs?: object): Promise<IHttpClientResponse>;
  post(url: string, body: object): Promise<IHttpClientResponse>;
  delete(url: string): Promise<IHttpClientResponse>;
  patch(url: string, body: object): Promise<IHttpClientResponse>;
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
