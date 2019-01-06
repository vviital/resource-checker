import configurations from '@resource-checker/configurations';

import Worker from './worker';

new Worker(configurations, { repeat: 100000000 }).execute();
