import { IConfiguration } from '@resource-checker/configurations';
import { Server } from '@resource-checker/base';

import createRoutes from './routes';
import { ICreateModel } from './models';

export interface IAppOptions {
  createModel: ICreateModel,
};

class App extends Server {
  constructor(config: IConfiguration, protected options: IAppOptions) {
    super(config);
  }

  protected async registerRoutes() {
    await super.registerRoutes();
    this.server.route(createRoutes(this.config, this.options.createModel));
  }
}

export default App;
