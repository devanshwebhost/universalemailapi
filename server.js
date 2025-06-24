const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// File upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = './uploads';
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST /config route
app.post('/config', upload.single('logo'), (req, res) => {
  try {
    const {
      ownerEmail,
      appPassword,
      adminEmail,
      replyMessage,
    } = req.body;

    const fields = req.body.fields ? JSON.parse(req.body.fields) : [];

    const configData = {
      ownerEmail,
      appPassword,
      adminEmail,
      replyMessage,
      fields,
      logoPath: req.file ? `/uploads/${req.file.filename}` : null,
      updatedAt: new Date().toISOString(),
    };

    // Save config to file (or later to DB)
    fs.writeFileSync('config.json', JSON.stringify(configData, null, 2));
    console.log('✅ Config saved!');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error saving config:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve uploads folder for logo display
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
