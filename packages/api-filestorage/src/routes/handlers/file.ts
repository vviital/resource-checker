import { IConfiguration } from '@resource-checker/configurations';
import * as hapi from 'hapi';
import * as Boom from 'boom';

import { IModel, ICreateModel } from '../../models';
import { IFileStorageModelInput } from '../../models/interfaces';

export default class FileHandler {
  private model: IModel;

  constructor(config: IConfiguration, createModel: ICreateModel) {
    this.model = createModel(config);
  }

  async getFileInfo(request: hapi.Request, h: hapi.ResponseToolkit) {
    const { id } = request.params;

    const fileInfo = await this.model.findById(id);

    if (fileInfo === null) {
      throw Boom.notFound('File not fould');
    }

    return h.response(fileInfo).code(200);
  }

  async uploadFile(request: hapi.Request, h: hapi.ResponseToolkit) {
    const { payload } = request;

    const result = await this.model.save(payload as IFileStorageModelInput);

    return h.response(result).code(201);
  }

  async uploadStream(request: hapi.Request, h: hapi.ResponseToolkit) {
    const filename = request.headers['x-filename'];
    const stream = request.payload as NodeJS.ReadStream;

    const result = await this.model.save({ filename, stream });

    return h.response(result).code(201);
  }

  async reindex() {
    
  }
}
