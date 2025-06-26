const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // unique per user
  ownerEmail: String,
  appPassword: String,
  adminEmail: String,
  replyMessage: String,
  logoPath: String,
  fields: Array,
  updatedAt: Date
});

module.exports = mongoose.model('Config', ConfigSchema);
