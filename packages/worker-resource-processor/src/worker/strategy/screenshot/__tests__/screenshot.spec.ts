import Chrome from '../../../../clients/chrome'
import ScreenshotStrategy from '../screenshot';
jest.mock('../../../../clients/chrome');

describe('ScreenshotStrategy', () => {
  describe('handle', async () => {
    it('should process url', async () => {
      const strategy = new ScreenshotStrategy({ get: () => '' }, { revisions: [] });
      const result = await strategy.handle('https://example.com');

      expect(result).toEqual(expect.objectContaining({
        id: expect.any(String),
        revisionObject: {
          fileId: '1',
        },
        type: 'ScreenshotStrategy',
      }));
    });
  });
});
