import App from './app';
import config from './config';

new App(config).init();

process.on('unhandledRejection', (err: Error): void => {
  console.log(err);
  process.exit(1);
});
