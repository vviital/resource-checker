import App from './app';
import configurations from './config';
import createModel from './models';

const app = new App(configurations, { createModel });

const logger = console;

app
  .init()
  .catch(logger.error);
