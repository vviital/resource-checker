import { Server } from 'hapi';
import { fs } from '../helpers';

import { IRouteConfig, IHandlerOptions } from './interfaces';

const registerRoutes = (server: Server, options: IHandlerOptions) => {
  fs.importDefaultModules(__dirname, (createRoutes: (options: IHandlerOptions) => IRouteConfig[]) => {
    server.route(createRoutes(options));
  });
};

export {
  registerRoutes,
}
