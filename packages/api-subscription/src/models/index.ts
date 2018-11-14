import * as mongoose from 'mongoose';
import { join } from 'path';

import { fs } from '../helpers';
import { IConfiguration } from '@resource-checker/configurations';
import BaseSchema from './schemas/base';

const constructUrl = (config: IConfiguration) => {
  const username = config.get('mongoUsername');
  const password = config.get('mongoPassword');
  const database = config.get('mongoDatabase');
  const host = config.get('mongoHost');
  const port = config.get('mongoPort');

  let url = 'mongodb://';

  if (username && password) {
    url += `${username}:${password}@`;
  }

  url += `${host}:${port}/${database}`;

  return url;
};

const connect = (config: IConfiguration): mongoose.Connection => {
  const url = constructUrl(config);

  const datasource: mongoose.Connection = mongoose.createConnection(url);

  return datasource;
};

const registerModels = (connection: mongoose.Connection) => {
  const models: { [modelName: string]: BaseSchema<mongoose.Document> } = {};

  const register = (createModel: (connection: mongoose.Connection) => BaseSchema<mongoose.Document>) => {
    const model = createModel(connection);

    models[model.name] = model;
  };

  fs.importDefaultModules(join(__dirname, 'schemas'), register, ['base']);

  return models;
}

export {
  connect,
  registerModels,
};
