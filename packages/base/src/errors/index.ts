import { isObject, isString } from 'lodash';

class ErrorObject {
  public readonly type: String;
  public readonly date: Date;
  public readonly meta: Readonly<object>;

  constructor(public readonly message: string, meta: Readonly<any> = {}) {
    this.type = 'Error';
    this.date = new Date();

    if (!isObject(meta)) return;

    if (meta.hasOwnProperty('stack')) {
      const stack: any = meta.stack;

      if (isString(stack)) {
        const stack = (meta.stack || '').split('\n').map((x: string) => x.trim());

        this.meta = { ...meta, stack }
      }
    } else {
      this.meta = meta;
    }
  }
}

export default ErrorObject;
