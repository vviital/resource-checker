import * as shortid from 'shortid';

import { IFileStorageModelInput, IFileStorageModelOutput } from './interfaces';

export interface IAsyncIterator<T> extends AsyncIterator<T> {
  close?(): Promise<any>;
}

export interface IModel {
  addModel(model: Base): void;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<IFileStorageModelOutput|null>;
  save(object: IFileStorageModelInput): Promise<ICreationStatus>;
  [Symbol.asyncIterator](): IAsyncIterator<IFileStorageModelOutput>;
}

export interface IModelInnerHelpers {
  finalize(object: object): Promise<void>;
}

export interface ICreationStatus {
  id: string;
  status: 'created';
}

export interface IModelOptions {
  primary?: boolean;
}

export default abstract class Base implements IModel, IModelInnerHelpers {
  constructor(protected options: IModelOptions = { primary: false }) {

  }

  get primary() {
    return this.options.primary || false;
  }

  abstract findById(id: string): Promise<IFileStorageModelOutput|null>;
  abstract delete(id: string): Promise<void>;

  save(object: IFileStorageModelInput): Promise<ICreationStatus> {
    const result: ICreationStatus = {
      id: shortid.generate(),
      status: 'created',
    };

    return Promise.resolve(result);
  }

  finalize(object: IFileStorageModelInput): Promise<void> {
    return Promise.resolve();
  }

  addModel(model: Base) {
  }

  [Symbol.asyncIterator](): IAsyncIterator<IFileStorageModelOutput> {
    return ({
      next: () => Promise.resolve({ value: { id: '' }, done: true }),
    });
  }
}
