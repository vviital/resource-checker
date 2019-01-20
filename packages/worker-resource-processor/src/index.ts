import configurations from '@resource-checker/configurations';

import { ResourceProcessor, ResourceRetrieval } from './worker';

const repeat = 60 * 60 * 1000;

const main = async () => {
  const resourceRetrieval = new ResourceRetrieval(configurations, { repeat });
  const processor = new ResourceProcessor(configurations);

  await processor.initialize();
  resourceRetrieval.execute();
};

main().catch(console.error);
