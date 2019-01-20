import * as joi from 'joi';

import SubscriptionHandler from './handlers';
import { IRouteConfig, IHandlerOptions } from '../interfaces';
import { IConfiguration } from '@resource-checker/configurations';

const schemas = {
  id: {
    id: joi.string().required(),
  },
  subscription: {
    email: joi.string().email().required(),
    url: joi.string().uri().required(),
  },
  revision: {
    revisionObject: joi.object().required(),
    type: joi.string().required(),
  },
};

const createRoutes = (config: IConfiguration, options: IHandlerOptions): IRouteConfig[] => {
  const handler = new SubscriptionHandler(config, options);
  const basepath = '/subscriptions';

  const mapping: IRouteConfig[] = [ {
    method: 'POST',
    path: `${basepath}`,
    handler: handler.registerSubscription.bind(handler),
    options: {
      validate: {
        payload: schemas.subscription,
      },
    },
  }, {
    method: 'GET',
    path: `${basepath}/{id}`,
    handler: handler.getSubscription.bind(handler),
    options: {
      validate: {
        params: schemas.id,
      },
    },
  }, {
    method: 'PATCH',
    path: `${basepath}/{id}`,
    handler: handler.updateSubscription.bind(handler),
    options: {
      validate: {
        params: schemas.id,
        payload: schemas.revision,
      },
    },
  }, {
    method: 'DELETE',
    path: `${basepath}/{id}`,
    handler: handler.cancelSubscription.bind(handler),
    options: {
      validate: {
        params: schemas.id,
      },
    }
  }, {
    method: 'GET',
    path: `${basepath}/next/{timestamp}`,
    handler: handler.getNext.bind(handler),
  }];

  return mapping;
}

export default createRoutes;
