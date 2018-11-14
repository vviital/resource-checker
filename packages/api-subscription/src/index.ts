import config from '@resource-checker/configurations';

import App from './app';

new App(config).init();

process.on('unhandledRejection', (err: Error): void => {
  console.log(err);
  process.exit(1);
});
