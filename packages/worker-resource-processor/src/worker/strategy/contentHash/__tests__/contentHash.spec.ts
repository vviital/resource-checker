import { POM } from '@resource-checker/test-utils';

import ContentHashStrategy from '../index';

describe('Content Hash Strategy', () => {
  const strategy = new ContentHashStrategy({ get: () => '' }, { revisions: [] });

  describe('when server respond with page', () => {
    const url = 'https://example.com';
    const page = POM.content(url);
  
    beforeEach(() => {
      page.prepare();
    });
  
    afterEach(() => {
      page.cleanUp();
    });
  
    it('should process page and return hash', async () => {
      const response = await strategy.handle(url);
  
      expect(response).toEqual(expect.objectContaining({
        revision: expect.objectContaining({
          created: expect.any(Date),
          id: expect.any(String),
          type: 'ContentHashStrategy',
          revisionObject: expect.objectContaining({
            hash: page.info.hash,
            statusCode: 200,
          }),
        }),
        score: {
          score: 1,
          weight: 1,
        },
      }));
    });
  });

  describe('when server throws some error', () => {
    const url = 'https://example.com';
    const page = POM.content(url, { throwError: 404 });
  
    beforeEach(() => {
      page.prepare();
    });
  
    afterEach(() => {
      page.cleanUp();
    });
  
    it('should process page and return error object', async () => {
      const response = await strategy.handle(url);
  
      expect(response).toEqual(expect.objectContaining({
        date: expect.any(Date),
        message: 'Response code 404 (Not Found)',
        meta: expect.objectContaining({
          source: 'ContentHashStrategy',
          stack: expect.any(Array),
        }),
      }));
    });
  });
});
