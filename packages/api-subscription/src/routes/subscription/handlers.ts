import { Request, ResponseToolkit } from 'hapi';
import { Document } from 'mongoose';
import * as _ from 'lodash';

import { IHandlerOptions } from '../interfaces';

import BaseSchema from '../../models/schemas/base';
import { ISubscriptionModel } from '../../models/schemas/subscription/index';
import { DocumentNotFoundError } from '../../errors';

class SubscriptionHandler {
  private models: { [modelName: string]: BaseSchema<Document> };
  private Subscription: BaseSchema<Document>;

  constructor(private options: IHandlerOptions) {
    this.models = this.options.models;
    this.Subscription = this.options.models.Subscription;

    if (!_.isObject(this.Subscription)) {
      throw new Error('Subscription should be a valid object');
    }
  }

  public async registerSubscription(request: Request, h: ResponseToolkit) {
    const email: string = (request.payload as any).email;
    const url: string = (request.payload as any).url;

    const Subscription = this.Subscription as unknown as ISubscriptionModel;

    let subscription = await Subscription.findByUrlAndEmail(email, url);

    if (subscription) return h.response(subscription).code(201);

    subscription = await this.Subscription.create({ email, url });

    return h.response(subscription).code(201);
  }

  public async getSubscription(request: Request, h: ResponseToolkit) {
    const subscription = await this.Subscription.findById(request.params.id);

    if (!subscription) {
      throw new DocumentNotFoundError('Subscription not found');
    }

    return subscription;
  }

  public async cancelSubscription(request: Request, h: ResponseToolkit) {
    await this.Subscription.deleteById(request.params.id);

    return h.response().code(204);
  }

  public async updateSubscription(request: Request, h: ResponseToolkit) {
    const id = request.params.id;
    const revisionObject: object = (request.payload as any).revisionObject;
    const type: string = (request.payload as any).type;

    const Subscription = (this.Subscription as unknown as ISubscriptionModel);

    await Subscription.addRevision(id, { revisionObject, type });
    
    return h.response().code(204);
  }
}

export default SubscriptionHandler;
