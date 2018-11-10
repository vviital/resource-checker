import { Connection, Document } from 'mongoose';

import BaseSchema from '../base';
import { createSubscriptionModel } from '../../datasources';

interface IRevision {
  revisionObject: Object,
  type: string,
}

export interface ISubscriptionModel {
  findByUrlAndEmail(email: string, url: string): Promise<Object|null>;
  addRevision(id: string, revision: IRevision): Promise<void>;
}

class Subscription extends BaseSchema<Document> implements ISubscriptionModel {
  async findByUrlAndEmail(email: string, url: string): Promise<Object|null> {
    return this.datasource
      .findOne({ email, url })
      .then((object: Document|null) => {
        if (!object) return null;

        return object as unknown as Object;
      });
  }

  async addRevision(id: string, revision: IRevision): Promise<void> {
    const update = {
      $push: {
        revisions: {
          $each: [revision],
          $sort: { created: -1 },
          $slice: 10,
        },
      },
    };

    await this.datasource.findOneAndUpdate({ id }, update);
  }
}

const createSubscription = (connection: Connection): BaseSchema<Document> => {
  const options = {
    name: 'Subscription',
    connection,
  };

  const model = new Subscription(createSubscriptionModel, options);

  return model;
};

export default createSubscription;
