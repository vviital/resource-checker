import { IConfiguration } from '@resource-checker/configurations';

import BaseModel, { ICreationStatus, IModelOptions, IAsyncIterator } from './base';
import MongoClient, { IMongoClient } from '../clients/mongo';
import { IClientClass } from '../clients/interfaces';
import { IFileStorageModelInput, IFileStorageModelOutput } from './interfaces';

export default class Mongo extends BaseModel {
  private _client: IMongoClient;

  constructor(private config: IConfiguration,  options?: IModelOptions, ClientClass: IClientClass<IMongoClient> = MongoClient) {
    super(options);

    this._client = new ClientClass(config);
  }

  get client() {
    return this._client;
  }

  async delete(id: string) {
    return this.client.remove(id).then(() => Promise.resolve());
  }

  async findById(id: string): Promise<IFileStorageModelOutput|null> {
    return this.client.findById(id);
  }

  async finalize(object: IFileStorageModelInput): Promise<void> {
    if (!object.id) throw new Error('ID should be specified in finalize method');

    return this.client.update(object.id, { $set: { finalized: true } });
  }

  async save(object: IFileStorageModelInput): Promise<ICreationStatus> {
    if (!object.id) throw new Error('ID should be specified in save method');

    const response: ICreationStatus = {
      id: object.id,
      status: 'created',
    };

    return this.client.insert(object).then(() => response);
  }

  [Symbol.asyncIterator](): IAsyncIterator<IFileStorageModelOutput>  {
    const cursor = this.client.cursor();

    return ({
      async next() {
        return cursor
          .next()
          .then((value: IFileStorageModelOutput) => ({
            value: value ? value : { id: '' },
            done: value === null,
          }));
        }
    });
  }
}
