import * as hapi from 'hapi';

import * as pinoPlugin from 'hapi-pino';
import * as mongoose from 'mongoose';
import * as Boom from 'boom';

import * as routes from './routes';
import { connect, registerModels } from './models';

import { IConfiguration } from '@resource-checker/configurations';

class App {
  private server: hapi.Server;
  private datasource: mongoose.Connection;
  private models: any;

  constructor(private config: IConfiguration) {

  }

  private async failAction(request: hapi.Request, h: hapi.ResponseToolkit, err: Error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('ValidationError:', err.message);
      throw Boom.badRequest('Invalid request payload');
    } else {
      throw Boom.badRequest(err.message);
    }
  }

  async init(): Promise<void> {
    this.server = new hapi.Server({
      host: 'localhost',
      port: this.config.get('port'),
      routes: {
        validate: {
          failAction: this.failAction,
        }
      }
    });
  
    try {
      await this.server.register({
        plugin: pinoPlugin,
        options: {
          prettyPrint: false,
        }
      });
  
      this.datasource = connect(this.config);

      this.models = registerModels(this.datasource);

      routes.registerRoutes(this.server, { models: this.models });
  
      await this.server.start();
  
      console.log(`Server running at: ${this.server.info.uri}`);
    } catch (err) {
      console.error(err);
    }
  }

  async stop(): Promise<void> {
    await this.server.stop();
  }
}

export default App;
