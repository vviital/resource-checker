import { JsonHttpClient } from '@resource-checker/http-client';
import { IConfiguration } from '@resource-checker/configurations';
import ErrorObject from '../errors';

export interface IFileStorageResponse {
  filename: string;
  id: string;
  publicUrl: string;
}

export interface ICreationStatus {
  id: string;
  status: 'created';
}

const SECOND = 60 * 1000;

class FileStorage {
  private client: JsonHttpClient;
  private endpoint: string;

  constructor(protected config: IConfiguration) {
    this.client = new JsonHttpClient({ defaultOptions: { timeout: 60 * SECOND } });
    this.endpoint = this.config.get('filestorageEndpoint');
  }

  private getErrorObject(error: Error) {
    return new ErrorObject(error.message, { source: FileStorage.name, stack: error.stack });
  }

  async get(id: string): Promise<IFileStorageResponse | ErrorObject> {
    const url = `${this.endpoint}/${id}`;

    try {
      const response = await this.client.get(url);
  
      const body: IFileStorageResponse = response.body;

      return body;
    } catch (error) {
      return this.getErrorObject(error);
    }
  }

  async save(filename: string, stream: NodeJS.ReadableStream): Promise<ICreationStatus|ErrorObject> {
    const url = `${this.endpoint}/files/stream`;

    try {
      const response = await this.client.post(url, stream, { 'x-filename': filename });

      const body: ICreationStatus = response.body;

      return body;
    } catch (error) {
      return this.getErrorObject(error);
    }
  }
}

export default FileStorage;
