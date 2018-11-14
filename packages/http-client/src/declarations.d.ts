declare module '@keyv/redis' {
  class KeyvRedis {
    constructor(uri: string, opts?: object);
    _getNamespace(): string;
    get(key: string): Promise<object>;
    set(key: string, value: object, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
  }

  export = KeyvRedis;
}
