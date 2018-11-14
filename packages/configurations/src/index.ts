export { IConfiguration } from './config';
import ConfigurationClass, { IConfiguration } from './config';

import nconf from './nconf';

const config: IConfiguration = new ConfigurationClass(nconf);

export const Configuration = ConfigurationClass;
export default config;
