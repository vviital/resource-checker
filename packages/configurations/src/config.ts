import { constantCase } from 'change-case';

export interface IConfiguration {
  get(key: string): string;
  [key: string]: any,
}

class Configuration implements IConfiguration {
  constructor(private _configuration: IConfiguration) {
  }

  get(key: string): string {
    return (this._configuration.get(constantCase(key)) || '').replace(/\\n/g, '\n');
  }
}

export default Configuration;
