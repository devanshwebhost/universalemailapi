const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
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
app.get('/config.json', async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) return res.status(404).json({ error: "No config found" });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST config
app.post('/config', upload.single('logo'), async (req, res) => {
  try {
    const { ownerEmail, appPassword, adminEmail, replyMessage } = req.body;
    const fields = req.body.fields ? JSON.parse(req.body.fields) : [];

    const configData = {
      ownerEmail,
      appPassword,
      adminEmail,
      replyMessage,
      fields,
      logoPath: req.file ? `/uploads/${req.file.filename}` : null,
      updatedAt: new Date()
    };

    await Config.deleteMany();
    await Config.create(configData);

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error saving config:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve logo uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
