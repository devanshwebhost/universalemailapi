const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  ownerEmail: String,
  appPassword: String,
  adminEmail: String,
  replyMessage: String,
  fields: Array,
  logoPath: String,
  updatedAt: Date
});

module.exports = mongoose.model('Config', configSchema);
