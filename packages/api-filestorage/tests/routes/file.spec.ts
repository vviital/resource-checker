import * as fs from 'fs';
import * as path from 'path';

import { setupTestSuit, ITestSuit } from '@resource-checker/test-utils';
import { JsonHttpClient } from '@resource-checker/http-client';

import Server from '../../src/app';
import { createModel } from '../testClients';

const client = new JsonHttpClient({ defaultOptions: { throwHttpErrors: false } });

describe('Filestorage server', () => {
  let testSuit: ITestSuit;

  beforeEach(async () => {
    testSuit = setupTestSuit(Server, { options: { createModel } })();

    await testSuit.createServer();
  });

  afterEach(async () => {
    await testSuit.dropServer();
  });

  it('should get subscription by id', async () => {
    const { endpoint } = testSuit;

    const { body, statusCode } = await client.get(`${endpoint}/A`);

    expect(statusCode).toEqual(200);
    expect(body).toEqual({
      filename: 'A.txt',
      id: 'A',
      publicUrl: 'url-A',
    });
  });

  it('should create file', async () => {
    const { endpoint } = testSuit;
    let id: string;

    {
      const { body, statusCode } = await client.post(`${endpoint}/`, {
        data: 'some datum',
        filename: 'filename.txt',
      });
  
      expect(statusCode).toEqual(201);
      expect(body).toEqual(expect.objectContaining({
        id: expect.any(String),
        status: 'created',
      }));

      id = body.id;
    }

    {
      const { body, statusCode } = await client.get(`${endpoint}/${id}`);

      expect(statusCode).toEqual(200);
      expect(body).toEqual(expect.objectContaining({
        $set: {
          finalized: true,
        },
        filename: 'filename.txt',
        id,
        publicUrl: `url-${id}`,
        created: expect.any(String),
        updated: expect.any(String),
      }));
    }
  });

  it('should return 400 error if payload validation fails', async () => {
    const { endpoint } = testSuit;

    const { body, statusCode } = await client.post(`${endpoint}/`, {});

    expect(statusCode).toEqual(400);
    expect(body).toEqual({
      error: 'Bad Request',
      message: 'child "data" fails because ["data" is required]',
      statusCode: 400,
    });
  });

  it('should create file from stream', async () => {
    const { endpoint } = testSuit;
    const stream = fs.createReadStream(path.join(__dirname, 'file.txt'));
    let id: string;
    const headers = { 'x-filename': 'filename.txt' };

    {
      const { body, statusCode } = await client.post(`${endpoint}/stream`, stream, headers);

      expect(statusCode).toEqual(201);
      expect(body).toEqual(expect.objectContaining({
        id: expect.any(String),
        status: 'created',
      }));

      id = body.id;
    }

    {
      const { body, statusCode } = await client.get(`${endpoint}/${id}`);

      expect(statusCode).toEqual(200);
      expect(body).toEqual(expect.objectContaining({
        $set: {
          finalized: true,
        },
        filename: 'filename.txt',
        id,
        publicUrl: `url-[some stream datum]`,
        created: expect.any(String),
        updated: expect.any(String),
      }));
    }
  });
});
