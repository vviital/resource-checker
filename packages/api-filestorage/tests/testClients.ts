import { cloneDeep } from 'lodash';
import { IConfiguration } from '@resource-checker/configurations';

import { IStorageClient, IStorageObject } from '../src/clients/storage';
import { IMongoClient } from '../src/clients/mongo';
import { IFileStorageModelOutput, IFileStorageModelInput } from '../src/models/interfaces';
import Mongo from '../src/models/mongo';
import Storage from '../src/models/storage';
import Composite from '../src/models/composite';

interface ITestStore {
  storage: { [key: string]: { url: string } },
  mongo: { [key: string]: IFileStorageModelOutput },
};

const data: ITestStore = {
  storage: {
    'A': {
      url: 'url-A',
    },
    'B': {
      url: 'url-B',
    },
    'C': {
      url: 'url-C',
    }
  },
  mongo: {
    'A': {
      id: 'A',
      filename: 'A.txt',
    },
    'B': {
      id: 'B',
      filename: 'B.txt',
    },
    'C': {
      id: 'C',
      filename: 'C.txt',
    }
  }
}

class TestStorageClient implements IStorageClient {
  public data: ITestStore;

  constructor() {
    this.data = cloneDeep(data);
  }

  async insert(object: IStorageObject) {
    let url = `url-${object.filename}`;
    if (object.stream) {
      let data: string = '';

      for await (const chunk of object.stream) {
        data += chunk.toString();
      }

      url = `url-[${data.trim()}]`;
    }

    this.data.storage[(object as any).id || ''] = { url };
  }

  async getPublicUrl(filename: string, days?: number) {
    return this.data.storage[filename];
  }

  async delete(filename: string) {
    delete this.data.storage[filename];
  }

  async exists(filename: string) {
    return !!this.data.storage[filename];
  }
}

class TestMongoClient implements IMongoClient {
  public data: ITestStore;

  constructor() {
    this.data = cloneDeep(data);
  }

  async findById(id: string) {
    return this.data.mongo[id] || null;
  }

  async insert(object: IFileStorageModelInput) {
    this.data.mongo[object.id || ''] = {
      created: new Date(),
      filename: object.filename,
      id: object.id || '',
      updated: new Date(),
    };
  }

  async remove(id: string) {
    delete this.data.mongo[id];
  }

  async update(id: string, object: object) {
    this.data.mongo[id] = { ...this.data.mongo[id], ...(object as IFileStorageModelOutput) };
  }

  cursor() {
    const arrayOfIds = ['A', 'B', 'C'];
    let counter = 0;

    return ({
      next: async () => {
        if (!arrayOfIds[counter]) {
          return null;
        }

        return this.data.mongo[arrayOfIds[counter++]];
      },
      async close() {}
    });
  }
}

const createClients = () => {
  const testData = cloneDeep(data);

  return {
    TestMongoClient,
    TestStorageClient,
    testData,
  }
};

const createModel = (config: IConfiguration) => {
  const { TestMongoClient, TestStorageClient } = createClients();

  const mongo = new Mongo(config, { primary: true }, TestMongoClient);
  const storage = new Storage(config, { primary: false }, TestStorageClient);
  const composite = new Composite();

  composite.addModel(mongo);
  composite.addModel(storage);

  return composite;
};

export {
  createClients,
  createModel,
}
