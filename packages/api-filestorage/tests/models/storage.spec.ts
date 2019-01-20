import * as sinon from 'sinon';

import StorageModel from '../../src/models/storage';
import { createClients } from '../testClients';

describe('Storage model', () => {
  let client: StorageModel;

  beforeEach(() => {
    const { TestStorageClient } = createClients();
    client = new StorageModel({ get: () => '' }, {}, TestStorageClient);

    sinon.stub(client.client, 'insert');
    sinon.spy(client.client, 'exists');
    sinon.spy(client.client, 'getPublicUrl');
    sinon.spy(client.client, 'delete');
  });

  describe('#findById', () => {
    it('should find record by id', async () => {
      const result = await client.findById('A');

      expect(result).toEqual({
        id: 'A',
        publicUrl: 'url-A',
      });
      expect(client.client.exists).toHaveProperty('calledOnce', true);
      expect(client.client.getPublicUrl).toHaveProperty('calledOnce', true);
    });

    it('should return null if file is not exists', async () => {
      const result = await client.findById('D');

      expect(result).toBeNull();
      expect(client.client.exists).toHaveProperty('calledOnce', true);
      expect(client.client.getPublicUrl).toHaveProperty('called', false);
    });
  });

  describe('#delete', () => {
    it('should delete file', async () => {
      await client.delete('A');

      expect(client.client.delete).toHaveProperty('calledOnce', true);
    });
  });
});
