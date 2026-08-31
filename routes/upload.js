const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const auth = require('./authMiddleware');
const router = express.Router();

const extensionByMimeType = new Map([
  ['image/png', '.png'],
  ['image/jpeg', '.jpg'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif']
]);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = extensionByMimeType.get(file.mimetype);
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!extensionByMimeType.has(file.mimetype)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'logo'));
    }
    cb(null, true);
  }
});

router.post('/', auth, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({error: 'No file uploaded'});
  res.json({ filename: req.file.filename, url: '/uploads/' + req.file.filename });
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: '仅支持 2MB 以内的 PNG、JPG、WebP 或 GIF 图片' });
  }
  next(err);
});

module.exports = router;
