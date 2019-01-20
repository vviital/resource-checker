export type ExchangeType = 'direct'|'fanout';
export type PubSubCallback = {
  (message: object): void;
}

export type SubscribtionDescriptor = {
  unsubscribe(): Promise<void>;
}

export interface IPubSub {
  publish(msg: object, route: string, implicitBinding?: boolean): Promise<any>;
  subscribe(route: string, callback: PubSubCallback, implicitBinding?: boolean): Promise<SubscribtionDescriptor>;
}

export interface IConnectable {
  connect(): Promise<void>;
}

export type BasePubSubOptions = {
  prefetchCount: number,
  exchange: string;
};
