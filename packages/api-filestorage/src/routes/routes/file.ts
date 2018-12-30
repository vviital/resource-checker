import * as hapi from 'hapi';
import * as joi from 'joi';

import FileHandler from '../handlers/file';

export default function createRoutes(handler: FileHandler): hapi.ServerRoute[] {
  const prefix = '/files';

  const routes: hapi.ServerRoute[] = [{
    path: `${prefix}/{id}`,
    method: 'GET',
    handler: handler.getFileInfo.bind(handler),
  }, {
    path: `${prefix}/reindex`,
    method: 'POST',
    handler: handler.reindex.bind(handler),
  }, {
    path: `${prefix}`,
    method: 'POST',
    handler: handler.uploadFile.bind(handler),
    options: {
      validate: {
        payload: {
          data: joi.string().trim().not('').required(),
          filename: joi.string().trim().not('').required(),
        },
      },
    },
  }, {
    path: `${prefix}/stream`,
    method: 'POST',
    handler: handler.uploadStream.bind(handler),
    options: {
      payload: {
        output: 'stream',
        parse: false,
      },
      validate: {
        headers: joi.object({
          'x-filename': joi.string().trim().not('').required(),
        }).options({ allowUnknown: true }),
      }
    }
  }];

  return routes;
};
