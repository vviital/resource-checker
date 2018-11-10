export { IConfiguration } from './config';
import Configuration, { IConfiguration } from './config';

import nconf from './nconf';

const config: IConfiguration = new Configuration(nconf);

export default config;
