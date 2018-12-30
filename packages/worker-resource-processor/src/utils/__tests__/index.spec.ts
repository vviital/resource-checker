import { stringToStream } from '../index';

describe('utils', () => {
  describe('stringToStream', () => {
    it('should produce readable stream from string', async () => {
      const string = 'a'.repeat(1000 * 1000 - 1);

      const stream = stringToStream(string, 999);
      let result = '';

      for await (const chunk of stream) {
        result += chunk;
      }

      expect(result).toEqual(string);
    });

    it('should produce readable stream from string', async () => {
      const string = 'a'.repeat(1000 * 1000 - 1);

      const stream = stringToStream(string, 1000 * 1000 + 1);
      let result = '';

      for await (const chunk of stream) {
        result += chunk;
      }

      expect(result).toEqual(string);
    });

    it('should produce readable stream from string using default size', async () => {
      const string = 'a'.repeat(1000 * 1000 - 1);

      const stream = stringToStream(string);
      let result = '';

      for await (const chunk of stream) {
        result += chunk;
      }

      expect(result).toEqual(string);
    });
  });
});
