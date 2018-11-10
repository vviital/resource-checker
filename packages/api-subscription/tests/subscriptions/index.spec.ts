import * as got from 'got';

import { setupTestSuit, ITestSuit } from '../index';
import { string } from 'joi';

describe('CRUD operations over /subscriptions endpoint', () => {
  let scope: ITestSuit;
  let subscription: any;

  beforeAll(async () => {
    scope = setupTestSuit();
    await scope.createServer();
  });

  afterAll(async () => {
    await scope.dropServer();
  });

  it('should create subscription', async () => {
    const { body: response, statusCode } = await got(`${scope.endpoint}/subscriptions`, {
      method: 'POST',
      body: {
        url: 'http://test.com',
        email: 'test@test.com',
      },
      json: true,
    });

    subscription = response;

    expect(statusCode).toEqual(201);
    expect(subscription).toEqual(expect.objectContaining({
      url: 'http://test.com',
      email: 'test@test.com',
      id: expect.any(String),
    }));
  })

  it('should failed to create subscription with wrong url and email', async () => {
    const { body: response, statusCode } = await got(`${scope.endpoint}/subscriptions`, {
      method: 'POST',
      body: {
        url: 'test',
        email: 'test.test.com',
      },
      json: true,
      throwHttpErrors: false,
    });
  
    expect(statusCode).toEqual(400);
    expect(response).toEqual({
      error: 'Bad Request',
      message: 'child "email" fails because ["email" must be a valid email]',
      statusCode: 400,
    });
  });

  it('should return created subscription', async () => {
    const url = `${scope.endpoint}/subscriptions/${subscription.id}`;
    const { body, statusCode } = await got(url, { json: true });

    expect(statusCode).toEqual(200);
    expect(body).toEqual(subscription);
  });

  it('should update created subscription', async () => {
    const url = `${scope.endpoint}/subscriptions/${subscription.id}`;
    const { body, statusCode } = await got(url, {
      method: 'PATCH',
      body: {
        revisionObject: { field: 'some revision data' },
        type: 'type',
      },
      json: true,
    });

    expect(statusCode).toEqual(204);
    expect(body).toEqual('');

    const { body: updatedSubscription } = await got(url, { json: true });

    subscription = updatedSubscription;

    console.log('subscription', subscription);

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

  it('should delete created subscription', async () => {
    const url = `${scope.endpoint}/subscriptions/${subscription.id}`;
    const { body, statusCode } = await got(url, {
      method: 'DELETE',
      json: true,
    });

    expect(statusCode).toEqual(204);
    expect(body).toEqual('');
  });

  it('should return 404 error when try to access deleted subscription', async () => {
    const { body, statusCode } = await got(`${scope.endpoint}/subscriptions/${subscription.id}`, {
      json: true,
      throwHttpErrors: false,
    });

    expect(statusCode).toEqual(404);
  });
});
