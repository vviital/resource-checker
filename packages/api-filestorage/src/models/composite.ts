import * as PromiseHelpers from 'bluebird';
import { isEmpty } from 'lodash';

import BaseModel, { ICreationStatus, IAsyncIterator } from './base';
import { IFileStorageModelInput, IFileStorageModelOutput } from './interfaces';

export default class CompositeModel extends BaseModel {
  private models: BaseModel[];

  constructor() {
    super();

    this.models = [];
  }

  addModel(model: BaseModel) {
    this.models.push(model);
  }

  async findById(id: string): Promise<IFileStorageModelOutput|null> {
    const promises = this.models.map(model => model.findById(id));

    const results = await PromiseHelpers.all(promises);

    const object = results.reduceRight((prev, next: IFileStorageModelOutput) => {
      return { ...prev, ...next };
    }, null);

    if (isEmpty(object)) return null;

    return object;
  }

  async delete(id: string) {
    const promises = this.models.map(models => models.delete(id));

    await PromiseHelpers.all(promises);
  }

  async save(object: IFileStorageModelInput): Promise<ICreationStatus> {
    const data = await super.save(object);

    object.id = data.id;

    await PromiseHelpers.all(this.models.map(model => model.save(object)));

    await PromiseHelpers.all(this.models.map(model => model.finalize(object)));

    return data;
  }

  [Symbol.asyncIterator](): IAsyncIterator<IFileStorageModelOutput> {
    const primarySource = this.models.find(source => source.primary);

    if (!primarySource) throw new Error('Primary source should be specified at least in some model');

    const secondarySources = this.models.filter(source => source !== primarySource);

    const primaryIterator = primarySource[Symbol.asyncIterator]();

    const cleanUpResources = async () => {
      if (primaryIterator.close) {
        await primaryIterator.close();
      }
    };

    return ({
      async next() {
        const { value, done } = await primaryIterator.next();

        if (!value || done) return { value: { id: '' }, done: true };

        const promises = secondarySources.map(model => model.findById(value.id));

        const secondaryValues = await Promise.all(promises);

        const combinedData = [...secondaryValues, value].reduce((prev, next: IFileStorageModelOutput) => {
          return { ...prev, ...next };
        }, null);

        if (!combinedData) {
          await this.close();

          throw new Error('Something wrong happended during iteration');
        }

        return {
          value: combinedData,
          done,
        };
      },

      async return() {
        await this.close();

        return { value: { id: '' }, done: true };
      },

      async throw() {
        await this.close();

        return { value: { id: '' }, done: true };
      },

      async close() {
        await cleanUpResources();
      }
    });
  }
}
