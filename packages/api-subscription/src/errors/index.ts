import * as Boom from 'boom';

class DocumentNotFoundError extends Boom {
  constructor(message: string, options?: Object) {
    super(message, { ...options, statusCode: 404 });
  }
}

export {
  DocumentNotFoundError,
}
