import Chrome from '../../../../clients/chrome'
import ScreenshotStrategy from '../screenshot';
jest.mock('../../../../clients/chrome');

describe('ScreenshotStrategy', () => {
  describe('handle', async () => {
    it('should process url and return fileId', async () => {
      const strategy = new ScreenshotStrategy({ get: () => '' }, { revisions: [] });

      expect((strategy as any).client.initialized).toBeFalsy();

      const result = await strategy.handle('https://example.com');

      expect((strategy as any).client.initialized).toBeTruthy();

      expect(result).toEqual(expect.objectContaining({
        revision: expect.objectContaining({
          created: expect.any(Date),
          id: expect.any(String),
          revisionObject: { fileId: '1' },
          type: 'ScreenshotStrategy',
        }),
        score: {
          score: 1,
          weight: 1,
        },
      }));
    });
  });
});
