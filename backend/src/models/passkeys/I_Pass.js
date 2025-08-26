// ./models/passkeys/I_Pass.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const InstitutionPassSchema = new Schema({
  passkey: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  eiin: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model('InstitutionPass', InstitutionPassSchema);