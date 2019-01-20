import * as sinon from 'sinon';

import MongoModel from '../../src/models/mongo';
import { createClients } from '../testClients';

describe('Storage model', () => {
  let client: MongoModel;

  beforeEach(() => {
    const { TestMongoClient } = createClients();
    client = new MongoModel({ get: () => '' }, {}, TestMongoClient);

    sinon.stub(client.client, 'insert').resolves();
    sinon.spy(client.client, 'findById');
    sinon.spy(client.client, 'remove');
    sinon.spy(client.client, 'update');
    sinon.spy(client.client, 'cursor');
  });

  describe('#findById', () => {
    it('should find record by id', async () => {
      const result = await client.findById('A');

      expect(result).toEqual({
        id: 'A',
        filename: 'A.txt',
      });
      expect(client.client.findById).toHaveProperty('calledOnce', true);
    });
  });

  describe('#delete', () => {
    it('should delete file', async () => {
      await client.delete('A');

      expect(client.client.remove).toHaveProperty('calledOnce', true);
    });
  });

  describe('#save', () => {
    it('should throw an error if id is not specified', async () => {
      const promise = client.save({ filename: 'test' });
      const expectedError = new Error('ID should be specified in save method');

      await expect(promise).rejects.toEqual(expectedError);
    });

    it('should return correct status if item was successfully saved', async () => {
      const result = await client.save({ filename: 'test', id: 'some-id' });

      expect(result).toEqual({
        id: 'some-id',
        status: 'created',
      });
    });
  });
});
