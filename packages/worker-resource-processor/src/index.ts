import configurations from '@resource-checker/configurations';

import Worker from './worker';

new Worker(configurations, { repeat: 10000 }).execute();
