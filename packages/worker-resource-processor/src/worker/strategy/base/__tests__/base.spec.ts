import BaseStrategy from '../index';

describe('BaseStrategy', () => {
  class TestStategy extends BaseStrategy {
    public formatResponse(data: object) {
      return super.formatResponse(data, { score: 1, weight: 1 });
    }

    public get previousRevisions() {
      return super.previousRevisions;
    }

    protected async createRevision(url: string) {
      return this.createRevisionObject({ url });
    }
  };

  const defaultOptions = {
    type: 'Test',
    revisions: [{
      id: '1',
      created: new Date(),
      revisionObject: {},
      type: 'Type',
    }, {
      id: '2',
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
        revision: expect.objectContaining({
          created: expect.any(Date),
          id: expect.any(String),
          revisionObject: { field: 'field' },
          type: 'Test',
        }),
        score: {
          score: 1,
          weight: 1,
        },
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

      expect(result).toEqual(expect.objectContaining({
        revision: expect.objectContaining({
          created: expect.any(Date),
          id: expect.any(String),
          revisionObject: { url: 'url' },
          type: 'Test',
        }),
        score: {
          score: 0,
          weight: 1,
        },
      }));
    });
  });
});
