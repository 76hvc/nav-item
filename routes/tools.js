const express = require('express');

const router = express.Router();

function parsePublicUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url;
  } catch {
    return null;
  }
}

router.get('/fetch-icon', (req, res) => {
  const targetUrl = parsePublicUrl(req.query.url);
  if (!targetUrl) {
    return res.status(400).json({ message: '请输入有效的网址' });
  }

  res.json({
    iconUrl: `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(targetUrl.hostname)}`
  });
});

module.exports = router;
