import { JsonHttpClient } from '@resource-checker/http-client';

import { setupTestSuit, ITestSuit } from '../index';

describe('CRUD operations over /subscriptions endpoint', () => {
  let scope: ITestSuit;
  let subscription: any;
  const client = new JsonHttpClient({ defaultOptions: { throwHttpErrors: false, timeout: 2000 } });

  beforeAll(async () => {
    scope = setupTestSuit();
    await scope.createServer();
  });

  afterAll(async () => {
    await scope.dropServer();
  });

  it('should create subscription', async () => {
    const body = {
      url: 'http://test.com',
      email: 'test@test.com',
    };

    const { body: response, statusCode } = await client.post(`${scope.endpoint}/subscriptions`, body);

    subscription = response;

    expect(statusCode).toEqual(201);
    expect(subscription).toEqual(expect.objectContaining({
      url: 'http://test.com',
      email: 'test@test.com',
      id: expect.any(String),
    }));
  })

  it('should failed to create subscription with wrong url and email', async () => {
    const body = {
      url: 'test',
      email: 'test.test.com',
    };

    const {
      body: response,
      statusCode,
    } = await client.post(`${scope.endpoint}/subscriptions`, body);
  
    expect(statusCode).toEqual(400);
    expect(response).toEqual({
      error: 'Bad Request',
      message: 'child "email" fails because ["email" must be a valid email]',
      statusCode: 400,
    });
  });

  it('should return created subscription', async () => {
    const { body, statusCode } = await client.get(`${scope.endpoint}/subscriptions/${subscription.id}`);

    expect(statusCode).toEqual(200);
    expect(body).toEqual(subscription);
  });

  it('should update created subscription', async () => {
    const url = `${scope.endpoint}/subscriptions/${subscription.id}`;
    const update = {
      revisionObject: { field: 'some revision data' },
      type: 'type',
    };

    const { body, statusCode } = await client.patch(url, update);

    expect(statusCode).toEqual(204);
    expect(body).toEqual('');

    const { body: updatedSubscription } = await client.get(url);

    subscription = updatedSubscription;

    expect(subscription).toEqual(expect.objectContaining({
      url: 'http://test.com',
      email: 'test@test.com',
      id: expect.any(String),
      revisions: [expect.objectContaining({
        created: expect.any(String),
        revisionObject: { field: 'some revision data' },
        type: 'type',
      })],
    }));
  });

  it('should return next created subscription', async () => {
    const date = new Date(subscription.created).getTime() - 1;

    const response1 = await client.get(`${scope.endpoint}/subscriptions/next/${date}`);

    const response2 = await client.get(`${scope.endpoint}/subscriptions/next/${date + 1}`);

    expect(response1.statusCode).toEqual(200);
    expect(response1.body).toEqual(expect.objectContaining({
      url: expect.any(String),
      revisions: expect.any(Array),
    }));
    expect(response1).not.toEqual(expect.objectContaining({
      email: expect.anything(),
    }));
    expect(response2.statusCode).toEqual(404);
  });

  it('should delete created subscription', async () => {
    const url = `${scope.endpoint}/subscriptions/${subscription.id}`;
    const { body, statusCode } = await client.delete(url);

    expect(statusCode).toEqual(204);
    expect(body).toEqual('');
  });

  it('should return 404 error when try to access deleted subscription', async () => {
    const { statusCode } = await client.get(`${scope.endpoint}/subscriptions/${subscription.id}`)

    expect(statusCode).toEqual(404);
  });
});
