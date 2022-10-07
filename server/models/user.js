import { Schema, model } from 'mongoose';

export default model('users', new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firebaseKeys: {
    type: Array,
  },
  joinedAt: {
    type: Date,
  },
}));
