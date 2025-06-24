require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sendEmails = require('./mailer/sendEmail');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/send-email', upload.array('attachments'), async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const attachments = req.files?.map(file => ({
      filename: file.originalname,
      path: file.path,
    })) || [];

    await sendEmails({ name, email, message, attachments });

    res.status(200).json({ success: true, message: 'Emails sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Email sending failed!' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
