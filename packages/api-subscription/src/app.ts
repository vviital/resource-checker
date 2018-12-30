import * as mongoose from 'mongoose';

import * as routes from './routes';
import { connect, registerModels } from './models';

import { Server } from '@resource-checker/base';

class App extends Server {
  protected async registerDatasources() {
    this.datasource = connect(this.config);

    this.models = registerModels(this.datasource);
  }

  protected async registerRoutes() {
    await super.registerRoutes();

    routes.registerRoutes(this.server, { models: this.models });
  }

  public async stop() {
    await super.stop();
    await mongoose.disconnect();
  }
}

export default App;
