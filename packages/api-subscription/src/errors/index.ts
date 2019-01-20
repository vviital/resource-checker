import * as Boom from 'boom';

class DocumentNotFoundError extends Boom {
  constructor(message: string, options?: object) {
    super(message, { ...options, statusCode: 404 });
  }
}

export {
  DocumentNotFoundError,
}
