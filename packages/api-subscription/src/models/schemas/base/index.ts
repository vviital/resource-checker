import { Model, Document, Connection } from 'mongoose';
import * as errors from '../../../errors';

interface IOptions {
  name: string,
  connection: Connection,
}

class BaseSchema<T extends Document> {
  protected datasource: Model<T>;

  constructor(createDatasource: (connection: Connection) => Model<T>, protected options: IOptions) {
    this.datasource = createDatasource(this.options.connection);
  }

  get name() {
    return this.options.name;
  }

  async create(body: object): Promise<object> {
    return this.datasource.create(body);
  }

  async findById(id: string): Promise<object> {
    return this.datasource
      .findOne({ id })
      .catch((error: Error) => {
        throw new errors.DocumentNotFoundError(error.message);
      });
  }

  async deleteById(id: string): Promise<object> {
    return this.datasource
      .deleteOne({ id })
      .catch((error: Error) => {
        throw new errors.DocumentNotFoundError(error.message);
      });
  }

  async updateById(id: string, update: object): Promise<object> {
    return this.datasource
      .updateOne({ id }, update)
      .catch((error: Error) => {
        throw new errors.DocumentNotFoundError(error.message);
      });
  }
}

export default BaseSchema;
