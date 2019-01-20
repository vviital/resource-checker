import { Server } from 'hapi';
import { fs } from '../helpers';

import { IRouteConfig, IHandlerOptions } from './interfaces';
import { IConfiguration } from '@resource-checker/configurations';

const registerRoutes = (server: Server, config: IConfiguration, options: IHandlerOptions) => {
  fs.importDefaultModules(__dirname, (createRoutes: (config: IConfiguration, options: IHandlerOptions) => IRouteConfig[]) => {
    server.route(createRoutes(config, options));
  });
};

export {
  registerRoutes,
}
