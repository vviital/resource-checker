import { IConfiguration } from '@resource-checker/configurations';

import FileHandler from './handlers/file';
import createFileRoutes from './routes/file';
import { ICreateModel } from '../models';

export default function createRoutes (config: IConfiguration, createModel: ICreateModel) {
  const fileHandler = new FileHandler(config, createModel);

  return [...createFileRoutes(fileHandler)];
};
