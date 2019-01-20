import { IConfiguration } from '@resource-checker/configurations';

import BaseModel, { IModel } from './base';
import CompositeModel from './composite';
import MongoModel from './mongo';
import StorageModel from './storage';

export interface ICreateModel {
  (config: IConfiguration): IModel,
}

export const createModel: ICreateModel = (config: IConfiguration): IModel => {
  const mongo: BaseModel = new MongoModel(config, { primary: true });
  const storage: BaseModel = new StorageModel(config);
  const composite: IModel = new CompositeModel();

  composite.addModel(mongo);
  composite.addModel(storage);

  return composite;
};

export default createModel;

export { IModel } from './base';
