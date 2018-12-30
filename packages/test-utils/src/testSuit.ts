const getPort = require('get-port');

import { IConfiguration, Configuration } from '@resource-checker/configurations';

export interface IApp {
  init(): Promise<void>;
  stop(): Promise<void>;
}

export interface IAppClass {
  new (config: IConfiguration, options?: any): IApp;
}

export interface IMongoConnect {
  (config: IConfiguration): {
    dropDatabase(): Promise<any>;
    close(): Promise<any>;
  };
}

export interface ITestSuit {
  createServer(): Promise<void>;
  dropServer(): Promise<void>;
  endpoint: string,
  port: number,
  [key: string]: any,
};

export interface IDictionary {
  [key: string]: string,
}

interface IScope {
  port?: number,
  env?: {
    [env: string]: string,
  },
  server?: IApp,
  [key: string]: any,
}

export interface ITestSuitParams {
  mongoDBConnect?: IMongoConnect,
  // passthrough options to server
  options?: any,
}

const setupTestSuit = (App: IAppClass, params: ITestSuitParams = {}) => (envOverride: IDictionary = {}): ITestSuit => {
  const scope: IScope = {};
  let config: IConfiguration;

  const get = (key: string): string => {
    if (!scope.env) return '';

    return scope.env[key];
  };

  const createServer = async (): Promise<void> => {
    try {
      scope.port = +(await getPort());
  
      scope.env = {
        MONGO_DATABASE: `test_subscriptions_${scope.port}`,
        MONGO_HOST: 'mongodb',
        MONGO_PORT: '27017',
        PORT: scope.port.toString(),
        ...envOverride,
      };
  
      config = new Configuration({ get });
    
      scope.server = new App(config, params.options || {});
  
      await scope.server.init();
    } catch (error) {
      console.error(error);
    }
  };

  const dropServer = async (): Promise<void> => {
    try {
      if (!scope.server) return;

      await scope.server.stop();

      if (params.mongoDBConnect) {
        const connection = params.mongoDBConnect(config);
        await connection.dropDatabase();
        await connection.close();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return {
    createServer,
    dropServer,
    get port() {
      if (!scope.port) {
        return -1;
      }
      return scope.port;
    },
    get endpoint() {
      return `http://localhost:${scope.port}`;
    }
  };
}

export {
  setupTestSuit,
};
