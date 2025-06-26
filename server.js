const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const Config = require('./models/Config'); // ✅ Moved early

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = './uploads';
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

// GET config
app.get('/config.json/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const config = await Config.findOne({ userId });
    if (!config) return res.status(404).json({ error: "No config found for user" });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//post Save config
app.post('/config', upload.single('logo'), async (req, res) => {
  try {
    const userId = req.headers['x-user-id']; // from frontend
    if (!userId) return res.status(401).json({ success: false, error: "Missing user ID" });

    const { ownerEmail, appPassword, adminEmail, replyMessage } = req.body;
    const fields = req.body.fields ? JSON.parse(req.body.fields) : [];

    const configData = {
      userId,
      ownerEmail,
      appPassword,
      adminEmail,
      replyMessage,
      fields,
      logoPath: req.file ? `/uploads/${req.file.filename}` : null,
      updatedAt: new Date()
    };

    await Config.findOneAndUpdate({ userId }, configData, { upsert: true });
    res.json({ success: true });

  } catch (error) {
    console.error("❌ Error saving config:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});



app.post('/send-email', upload.any(), async (req, res) => {
  try {
    const formData = req.body;

    // Get config
    const config = await Config.findOne();
    if (!config) return res.status(404).json({ success: false, error: 'No config found' });

    // Prepare attachments if any
    const attachments = (req.files || []).map(file => ({
      filename: file.originalname,
      path: file.path,
    }));

    // Generate message HTML from dynamic fields
    const htmlBody = Object.entries(formData)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
      .join('');

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
      subject: 'New Message from Contact Form',
      html: htmlBody,
      attachments
    });

    res.json({ success: true });

  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Serve logo uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
