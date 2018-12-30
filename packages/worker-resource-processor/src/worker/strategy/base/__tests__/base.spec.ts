import BaseStrategy from '../index';

describe('BaseStrategy', () => {
  class TestStategy extends BaseStrategy {
    public formatResponse(data: object) {
      return super.formatResponse(data);
    }

    public get previousRevisions() {
      return super.previousRevisions;
    }
  };

  const defaultOptions = {
    type: 'Test',
    revisions: [{
      created: new Date(),
      revisionObject: {},
      type: 'Type',
    }, {
      created: new Date(),
      revisionObject: {},
      type: 'Test',
    }],
  };

  describe('formatResponse', () => {
    it('should return formated response', () => {
      const stategy = new TestStategy({ get: () => '' }, defaultOptions);

      const response = stategy.formatResponse({ field: 'field' });

      expect(response).toEqual(expect.objectContaining({
        id: expect.any(String),
        revisionObject: { field: 'field' },
        type: 'Test',
      }));
    });
  });

  describe('previousRevisions', () => {
    it('should return previous revisions based on type', () => {
      const stategy = new TestStategy({ get: () => '' }, defaultOptions);

      const revisions = stategy.previousRevisions;

      expect(revisions).toEqual([defaultOptions.revisions[1]]);
    });
  });

  describe('handle', () => {
    it('should return dumb processor result', async () => {
      const stategy = new TestStategy({ get: () => '' }, defaultOptions);

      const result = await stategy.handle('url');

      expect(result).toEqual({
        type: 'Placeholder',
        revisionObject: {
          url: 'url',
        },
      });
    });
  });
});
