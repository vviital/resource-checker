import { setupTestSuit } from '@resource-checker/test-utils';
export { ITestSuit } from '@resource-checker/test-utils';
export { Server } from '@resource-checker/base';

import App from '../src/app';
import { connect } from '../src/models';

const setupUp = setupTestSuit(App, { mongoDBConnect: connect });

export {
  setupUp as setupTestSuit,
};
