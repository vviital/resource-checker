import { POM } from '@resource-checker/test-utils';

import RedirectStrategy from '../index';

describe('Redirect strategy', () => {
  const strategy = new RedirectStrategy({ get: () => '' }, { revisions: [] });

  describe('if redirect it take place', () => {
    const url = 'https://example.com';
    const page = POM.content(url, { redirectTo: 'https://redirect.com' });

    beforeEach(() => {
      page.prepare();
    });
  
    afterEach(() => {
      page.cleanUp();
    });

    it('should follow redirect and save record about it', async () => {
      const response = await strategy.handle(url);
  
      expect(response).toEqual(expect.objectContaining({
        revision: expect.objectContaining({
          created: expect.any(Date),
          id: expect.any(String),
          type: 'RedirectStrategy',
          revisionObject: expect.objectContaining({
            hasRedirect: true,
            redirectUrls: ['https://redirect.com/'],
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

  describe('if redirect have not happend', () => {
    const url = 'https://example.com';
    const page = POM.content(url);

    beforeEach(() => {
      page.prepare();
    });
  
    afterEach(() => {
      page.cleanUp();
    });

    it('should process page and return processed result', async () => {
      const response = await strategy.handle(url);
  
      expect(response).toEqual(expect.objectContaining({
        revision: expect.objectContaining({
          created: expect.any(Date),
          id: expect.any(String),
          type: 'RedirectStrategy',
          revisionObject: expect.objectContaining({
            hasRedirect: false,
            redirectUrls: [],
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
          source: 'RedirectStrategy',
          stack: expect.any(Array),
        }),
      }));
    });
  });
});
