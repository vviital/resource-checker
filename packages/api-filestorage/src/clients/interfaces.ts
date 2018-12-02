import { IConfiguration } from '@resource-checker/configurations';

export interface IClientClass<T> {
  new (config: IConfiguration): T,
}
