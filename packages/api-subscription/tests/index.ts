const getPort = require('get-port');

import App from '../src/app';
import Configuration, { IConfiguration } from '../src/config/config';
import { connect } from '../src/models';

export interface ITestSuit {
  createServer(): Promise<void>;
  dropServer(): Promise<void>;
  endpoint: string,
  port: number,
};

interface IScope {
  port?: number,
  env?: {
    [env: string]: string,
  },
  server?: App,
}

export const setupTestSuit = (): ITestSuit => {
  const scope: IScope = {};
  let config: IConfiguration;

  const get = (key: string): string => {
    if (!scope.env) return '';

    return scope.env[key];
  };

  const createServer = async (): Promise<void> => {
    scope.port = +(await getPort());
  
    scope.env = {
      MONGO_DATABASE: `test_subscriptions_${scope.port}`,
      MONGO_HOST: 'mongodb',
      MONGO_PORT: '27017',
      PORT: scope.port.toString(),
    };

    config = new Configuration({ get });
  
    scope.server = new App(config);

    await scope.server.init();
  };

  const dropServer = async (): Promise<void> => {
    if (!scope.server) return;

    await scope.server.stop();

    await connect(config).dropDatabase();
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
