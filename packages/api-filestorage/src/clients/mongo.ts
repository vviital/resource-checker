import { Schema, Document, Model, Connection, createConnection, QueryCursor } from 'mongoose';
import { IConfiguration } from '@resource-checker/configurations';
import { IFileStorageModelInput, IFileStorageModelOutput } from '../models/interfaces';

// TODO: dry this code
const constructUrl = (config: IConfiguration) => {
  const username = config.get('mongoUsername');
  const password = config.get('mongoPassword');
  const database = config.get('mongoDatabase');
  const host = config.get('mongoHost');
  const port = config.get('mongoPort');

  let url = 'mongodb://';

  if (username && password) {
    url += `${username}:${password}@`;
  }

  url += `${host}:${port}/${database}`;

  return url;
};

interface IFileStorageMongoObject {
  created: Date;
  filename: string;
  finalized: Date;
  id?: any,
  modified: Date;
}

interface IFileStorageMongoModel extends IFileStorageMongoObject, Document {}

const FileStorage: Schema = new Schema({
  id: {
    required: true,
    type: String
  },
  filename: {
    type: String,
    required: true,
  },
  created: {
    default: Date.now,
    type: Date,
  },
  modified: {
    default: Date.now,
    type: Date,
  },
  finalized: {
    default: false,
    type: Boolean,
  },
});

FileStorage.index({ id: 1 }, { unique: true });
FileStorage.index({ filename: 1 });
FileStorage.index({ created: 1 });

export interface IMongoCursor {
  next(): Promise<any>;
  close(): Promise<any>;
}

export interface IMongoClient {
  insert(object: IFileStorageModelInput): Promise<void>;
  remove(id: string): Promise<void>;
  findById(id: string): Promise<IFileStorageModelOutput|null>;
  update(id: string, object: object): Promise<void>;
  cursor(query?: object): IMongoCursor,
};

class MongoStorage implements IMongoClient {
  private client: Model<IFileStorageMongoModel>;
  private connection: Connection;

  constructor(private config: IConfiguration) {
    const url = constructUrl(this.config);
    this.connection = createConnection(url);

    this.client = this.connection.model<IFileStorageMongoModel>('FileStorage', FileStorage);
  }

  async insert(object: IFileStorageModelInput): Promise<void> {
    return this.client.create(object).then(() => Promise.resolve());
  }

  async remove(id: string): Promise<void> {
    await this.client.deleteOne({ id });
  }

  async findById(id: string): Promise<IFileStorageModelOutput|null> {
    return this.client
      .findOne({ id })
      .then((result) => {
        if (!result) return null;

        return {
          created: result.created,
          filename: result.filename,
          finalized: result.finalized,
          id: result.id,
          modified: result.modified,
        };
      });
  }

  async update(id: string, object: object): Promise<void> {
    return this.client
      .updateOne({ id }, object)
      .then(() => Promise.resolve());
  }

  cursor(query: object = {}): IMongoCursor {
    const cursor = this.client.find(query).cursor();

    return {
      next: () => cursor.next(),
      close: () => cursor.close(),
    };
  }
}

export default MongoStorage;
