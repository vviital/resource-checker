import * as sinon from 'sinon';

import CompositeModel from '../../src/models/composite';
import MongoModel from '../../src/models/mongo';
import StorageModel from '../../src/models/storage';
import BaseModel, { IAsyncIterator } from '../../src/models/base';
import { createClients } from '../testClients';
import { IFileStorageModelOutput } from '../../src/models/interfaces';

describe('Composite model', () => {
  describe('#findById', () => {
    let composite: BaseModel;
    let testModelA: BaseModel;
    let testModelB: BaseModel;
  
    beforeEach(() => {
      composite = new CompositeModel();
      testModelA = new CompositeModel();
      testModelB = new CompositeModel();
  
      composite.addModel(testModelA);
      composite.addModel(testModelB);
  
      testModelA.findById = sinon.stub().resolves({ id: 'A' });
      testModelB.findById = sinon.stub().resolves({ id: 'B' });
    });

    it('should return combined results from two models', async () => {
      const result = await composite.findById('A');

      expect(result).toEqual({ id: 'A' });
      expect(testModelA.findById).toHaveProperty('calledOnce', true);
      expect(testModelB.findById).toHaveProperty('calledOnce', true);
    });
  });

  describe('#delete', () => {
    let composite: BaseModel;
    let testModelA: BaseModel;
    let testModelB: BaseModel;
  
    beforeEach(() => {
      composite = new CompositeModel();
      testModelA = new CompositeModel();
      testModelB = new CompositeModel();
  
      composite.addModel(testModelA);
      composite.addModel(testModelB);

      testModelA.delete = sinon.stub();
      testModelB.delete = sinon.stub();
    });

    it('should delete invoke delete function on each model', async () => {
      await composite.delete('A');

      expect(testModelA.delete).toHaveProperty('calledOnce', true);
      expect(testModelB.delete).toHaveProperty('calledOnce', true);
    });
  });

  describe('#save', () => {
    let composite: BaseModel;
    let testModelA: BaseModel;
    let testModelB: BaseModel;
  
    beforeEach(() => {
      composite = new CompositeModel();
      testModelA = new CompositeModel();
      testModelB = new CompositeModel();
  
      composite.addModel(testModelA);
      composite.addModel(testModelB);

      testModelA.save = sinon.stub();
      testModelA.finalize = sinon.stub();
      testModelB.save = sinon.stub();
      testModelB.finalize = sinon.stub();
    });

    it('should save data to all models', async () => {
      const result = await composite.save({ filename: 'filename' });

      expect(result).toEqual({
        id: expect.any(String),
        status: 'created',
      });

      expect(testModelA.save).toHaveProperty('calledOnce', true);
      expect(testModelA.save).toHaveProperty('args', [[{ filename: 'filename', id: result.id }]]);
      expect(testModelA.finalize).toHaveProperty('calledOnce', true);

      expect(testModelB.save).toHaveProperty('calledOnce', true);
      expect(testModelB.save).toHaveProperty('args', [[{ filename: 'filename', id: result.id }]]);
      expect(testModelB.finalize).toHaveProperty('calledOnce', true);
    });
  });

  describe('#iterator', () => {
    let composite: BaseModel;
    let mongo: BaseModel;
    let storage: BaseModel;
  
    beforeEach(() => {
      const { TestMongoClient, TestStorageClient } = createClients();
      composite = new CompositeModel();
      mongo = new MongoModel({ get: () => '' }, { primary: true }, TestMongoClient);
      storage = new StorageModel({ get: () => '' }, {}, TestStorageClient);
  
      composite.addModel(mongo);
      composite.addModel(storage);
    });

    it('should iterate over data sources', async () => {
      const values: IFileStorageModelOutput[] = [];

      for await (const value of composite) {
        values.push(value);
      }

      expect(values).toEqual([
        {
          filename: 'A.txt',
          id: 'A',
          publicUrl: 'url-A',
        }, {
          filename: 'B.txt',
          id: 'B',
          publicUrl: 'url-B',
        }, {
          filename: 'C.txt',
          id: 'C',
          publicUrl: 'url-C',
        },
      ]);
    });

    it('should close cursor if iterator for some reasons was stoped', async () => {
      const values: IFileStorageModelOutput[] = [];

      let iterator: IAsyncIterator<IFileStorageModelOutput>|null = null;

      const tmp = composite[Symbol.asyncIterator];
      composite[Symbol.asyncIterator] = () => {
        iterator = tmp.call(composite) as IAsyncIterator<IFileStorageModelOutput>;
        iterator.close = sinon.spy();
        return iterator;
      }

      for await (const value of composite) {
        values.push(value);
        break;
      }

      expect(values).toEqual([
        {
          filename: 'A.txt',
          id: 'A',
          publicUrl: 'url-A',
        }
      ]);
      expect((iterator as unknown as IAsyncIterator<IFileStorageModelOutput>).close)
        .toHaveProperty('calledOnce', true);
    });

    it('should close cursor if iterator for some reasons received an error', async () => {
      const values: IFileStorageModelOutput[] = [];

      let iterator: IAsyncIterator<IFileStorageModelOutput>|null = null;

      const tmp = composite[Symbol.asyncIterator];
      composite[Symbol.asyncIterator] = () => {
        iterator = tmp.call(composite) as IAsyncIterator<IFileStorageModelOutput>;
        iterator.close = sinon.spy();
        return iterator;
      }

      try {
        for await (const value of composite) {
          values.push(value);
          throw new Error();
        }
      } catch (error) {
        console.error(error);
      }

      expect(values).toEqual([
        {
          filename: 'A.txt',
          id: 'A',
          publicUrl: 'url-A',
        }
      ]);
      expect((iterator as unknown as IAsyncIterator<IFileStorageModelOutput>).close)
        .toHaveProperty('calledOnce', true);
    });
  });
});
