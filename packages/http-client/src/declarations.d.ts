declare module '@keyv/redis' {
  class KeyvRedis {
    constructor(uri: string, opts?: Object);
    _getNamespace(): string;
    get(key: string): Promise<Object>;
    set(key: string, value: Object, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
  }

  export = KeyvRedis;
}
