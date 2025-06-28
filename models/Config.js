const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  apiKey: { type: String, required: true, unique: true }, // One config per apiKey
  ownerEmail: String,
  appPassword: String,
  adminEmail: String,
  replyMessage: String,
  logoPath: String,
  fields: Array,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Config', ConfigSchema);
