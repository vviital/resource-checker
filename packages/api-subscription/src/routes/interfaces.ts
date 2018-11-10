import { Document } from 'mongoose';
import { ServerRoute } from 'hapi';

import BaseSchema from '../models/schemas/base'

export interface IRouteConfig extends ServerRoute {
}

export interface IHandlerOptions {
  models: {
    [modelName: string]: BaseSchema<Document>;
  }
};
