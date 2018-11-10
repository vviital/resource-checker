import { constantCase } from 'change-case';

export interface IConfiguration {
  get(key: string): string;
}

class Configuration implements IConfiguration {
  constructor(private _configuration: IConfiguration) {
  }

  get(key: string): string {
    return this._configuration.get(constantCase(key)) || '';
  }
}

export default Configuration;
