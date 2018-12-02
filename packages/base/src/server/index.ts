import * as hapi from 'hapi';

import * as pinoPlugin from 'hapi-pino';
import * as mongoose from 'mongoose';
import * as Boom from 'boom';

import { IConfiguration } from '@resource-checker/configurations';

export interface IServer {
  init(): Promise<void>;
  stop(): Promise<void>;
}

class BaseServer implements IServer {
  protected server: hapi.Server;
  protected datasource: mongoose.Connection;
  protected models: any;
  protected status: boolean;

  constructor(protected config: IConfiguration, protected options?: any) {
  }

  protected async failAction(request: hapi.Request, h: hapi.ResponseToolkit, err: Error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('ValidationError:', err.message);
      throw Boom.badRequest('Invalid request payload');
    } else {
      throw Boom.badRequest(err.message);
    }
  }

  protected async registerPlugins() {
    await this.server.register({
      plugin: pinoPlugin,
      options: {
        prettyPrint: false,
      }
    });
  }

  private healthCheck(): hapi.ServerRoute {
    return {
      method: 'GET',
      path: '/health',
      handler: (request: hapi.Request, h: hapi.ResponseToolkit) => {
        return h.response({ status: this.status ? 'ok' : 'not-running' }).code(200);
      },
    };
  }

  protected async registerDatasources() {
    console.log('registerDatasources method is not implemented in base class');
  }

  protected async registerRoutes() {
    this.server.route(this.healthCheck());
  }

  async init(): Promise<void> {
    this.status = false;

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
      await this.registerPlugins();

      await this.registerDatasources();

      await this.registerRoutes();
  
      await this.server.start();
  
      console.log(`Server running at: ${this.server.info.uri}`);
      this.status = true;
    } catch (err) {
      console.error(err);
    }
  }

  async stop(): Promise<void> {
    await this.server.stop();
  }
}

export default BaseServer;
