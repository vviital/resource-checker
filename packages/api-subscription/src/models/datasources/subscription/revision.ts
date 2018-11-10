import { Schema } from 'mongoose';

const Revision: Schema = new Schema({
  created: {
    default: Date.now,
    type: Date,
  },
  revisionObject: {
    type: Object,
  },
  type: {
    type: String,
  },
});

export default Revision;
