const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  apiKey: { type: String, required: true, unique: true }, // ✅ used to find user
  userId: { type: String, required: true, unique: true }, // ✅ Add this line
  ownerEmail: String,
  appPassword: String,
  adminEmail: String,
  replyMessage: String,
  logoPath: String,
  fields: Array,
  updatedAt: Date
});

module.exports = mongoose.models.Config || mongoose.model('Config', ConfigSchema);
