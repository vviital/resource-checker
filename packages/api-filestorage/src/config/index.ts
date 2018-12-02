import { Configuration, nconf, IConfiguration } from '@resource-checker/configurations';

class ExtendedConfigurations extends Configuration {
  private cache: {
    [key: string]: string;
  };

  constructor(config: IConfiguration, private prefixes: string[]) {
    super(config);
    this.cache = { '': '' };
  }

  get(key: string): string {
    if (this.cache[key]) return this.cache[key];

    this.cache[key] = this.prefixes
      .map((prefix) => {
        const capitalizedKey = key[0].toUpperCase() + key.slice(1);
        const finalKey = `${prefix}${capitalizedKey}`;

        return super.get(finalKey);
      })
      .filter(value => value)
      .shift() || '';

    return this.cache[key];  
  }
}

const config = new ExtendedConfigurations(nconf, ['firebase', '']);

export default config;
