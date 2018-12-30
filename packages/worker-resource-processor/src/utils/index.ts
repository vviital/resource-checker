import { Readable } from 'stream';

const DEFAULT_SIZE = 10000;

const stringToStream = (string: string, size: number = DEFAULT_SIZE) => {
  let current = 0;

  function read(this: Readable): void {
    let chunk: null|string = null;
    do {
      const limit = Math.min(current + size, string.length);
      chunk = string.slice(current, limit) || null;
      current = limit;
    } while (this.push(chunk, 'utf8'));
  }

  const stream = new Readable({ read  });
  
  return stream;
};

export {
  stringToStream,
};
