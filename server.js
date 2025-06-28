const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const Config = require('./models/Config'); // your config schema
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for logos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });


// ============================
// Save or Update Config Route
// ============================
app.post('/config', upload.single('logo'), async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ success: false, error: 'Missing API key' });

    const {
      ownerEmail,
      appPassword,
      adminEmail,
      replyMessage,
      fields
    } = req.body;

    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const configData = {
      apiKey,
      ownerEmail,
      appPassword,
      adminEmail,
      replyMessage,
      logoPath,
      fields: JSON.parse(fields || '[]'),
      updatedAt: new Date(),
    };

    await Config.findOneAndUpdate({ apiKey }, configData, { upsert: true });
    res.json({ success: true, message: 'Configuration saved successfully!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


// ============================
// Get Config by apiKey Route
// ============================
app.get('/config.json/:apiKey', async (req, res) => {
  try {
    const { apiKey } = req.params;
    const config = await Config.findOne({ apiKey });
    if (!config) return res.status(404).json({ success: false, error: 'Config not found' });

    res.json({ success: true, config });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


// ============================
// Send Email Route
// ============================
app.post('/send-email', upload.any(), async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ success: false, error: 'Missing API key' });

    const config = await Config.findOne({ apiKey });
    if (!config) return res.status(404).json({ success: false, error: 'Config not found for this API key' });

    const formData = {};
    req.body && Object.keys(req.body).forEach(key => {
      formData[key] = req.body[key];
    });

    // Logo (optional)
    let logoImage = '';
    if (config.logoPath) {
      const baseURL = `${req.protocol}://${req.get('host')}`;
      logoImage = `<img src="${baseURL}${config.logoPath}" alt="Logo" width="150"/>`;
    }

    // Build Email Content
    const fieldsHtml = Object.entries(formData)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
      .join('');

    const htmlContent = `
      ${logoImage}
      <h2>📩 New Contact Form Submission</h2>
      ${fieldsHtml}
      <p style="margin-top:20px;color:#555;">${config.replyMessage || ''}</p>
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.ownerEmail,
        pass: config.appPassword
      }
    });

    await transporter.sendMail({
      from: config.ownerEmail,
      to: config.adminEmail,
      subject: 'New Contact Form Submission',
      html: htmlContent
    });

    res.json({ success: true, message: 'Email sent successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Email failed to send' });
  }
});


// ============================
// Start Server
// ============================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
