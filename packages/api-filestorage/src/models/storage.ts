import { IConfiguration } from '@resource-checker/configurations';

import BaseModel, { ICreationStatus, IModelOptions } from './base';
import StorageClient, { IStorageClient } from '../clients/storage';
import { IClientClass } from '../clients/interfaces';
import { IFileStorageModelOutput, IFileStorageModelInput } from './interfaces';

export default class Storage extends BaseModel {
  private _client: IStorageClient;

  constructor(private config: IConfiguration, options?: IModelOptions, ClientClass: IClientClass<IStorageClient> = StorageClient) {
    super(options);

    this._client = new ClientClass(config);
  }

  get client() {
    return this._client;
  }

  async findById(id: string): Promise<IFileStorageModelOutput|null> {
    const exists = await this.client.exists(id);

    if (!exists) return null;

    const { url } = await this.client.getPublicUrl(id);

    return { publicUrl: url, id };
  }

  async delete(id: string) {
    return this.client.delete(id);
  }

  async save(object: IFileStorageModelInput): Promise<ICreationStatus> {
    if (!object.id) throw new Error('ID should be specified in save method');

    const response: ICreationStatus = {
      id: object.id,
      status: 'created',
    };

    return this.client
      .insert({ ...object, filename: object.id })
      .then(() => Promise.resolve(response));
  }
}
