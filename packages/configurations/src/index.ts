export { IConfiguration } from './config';
import ConfigurationClass, { IConfiguration } from './config';

import nconfConfig from './nconf';

const config: IConfiguration = new ConfigurationClass(nconfConfig);

const Configuration = ConfigurationClass;
const nconf: IConfiguration = nconfConfig;

export default config;

export {
  Configuration,
  nconf,
};
