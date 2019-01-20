import { isObject, isString } from 'lodash';

type Meta = {
  source?: string,
  stack?: string|string[],
  [key: string]: any,
};

class ErrorObject {
  public readonly type: String;
  public readonly date: Date;
  public readonly meta: Readonly<Meta>;

  constructor(public readonly message: string, meta: Readonly<Meta> = {}) {
    this.type = 'Error';
    this.date = new Date();

    if (!isObject(meta)) return;

    if (meta.hasOwnProperty('stack')) {
      const stack: string|string[] = meta.stack || [];

      if (isString(stack)) {
        const value = stack.split('\n').map((x: string) => x.trim());

        this.meta = { ...meta, stack: value }
      }
    } else {
      this.meta = meta;
    }
  }
}

export default ErrorObject;
