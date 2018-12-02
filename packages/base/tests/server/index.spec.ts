import BaseServer from '../../src/server';
import { JsonHttpClient } from '@resource-checker/http-client';
import { setupTestSuit, ITestSuit } from '@resource-checker/test-utils';

const client = new JsonHttpClient();

describe('BaseServer', () => {
  let testSuit: ITestSuit;

  beforeEach(async () => {
    testSuit = setupTestSuit(BaseServer)();

    await testSuit.createServer();
  });

  afterEach(async () => {
    await testSuit.dropServer(); 
  })

  it('should response for a health check endpoint', async () => {
    console.log('`${testSuit.endpoint}/health`', `${testSuit.endpoint}/health`);
    const { body } = await client.get(`${testSuit.endpoint}/health`);

    expect(body).toEqual({ status: 'ok' });
  });
});
