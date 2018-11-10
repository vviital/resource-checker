import { Schema, Document, Model, model, Connection } from 'mongoose';
import * as shortid from 'shortid';

import Revision from './revision';

const SubscriptionSchema: Schema = new Schema({
  id: {
    default: shortid.generate,
    type: String
  },
  url: {
    type: String,
    required: true,
  },
  email: {
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
  revisions: [Revision],
});

SubscriptionSchema.index({ id: 1 }, { unique: true });
SubscriptionSchema.index({ email: 1, url: 1 }, { unique: true });

const createSubscriptionModel = (connection: Connection): Model<Document> => {
  const Subscription: Model<Document> = connection.model<Document>('Subscription', SubscriptionSchema);

  return Subscription;
};

export default createSubscriptionModel;
