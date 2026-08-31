const express = require('express');
const path = require('path');
const fs = require('fs');
const menuRoutes = require('./routes/menu');
const cardRoutes = require('./routes/card');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ad');
const friendRoutes = require('./routes/friend');
const userRoutes = require('./routes/user');
const toolRoutes = require('./routes/tools');
const compression = require('compression');
const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '256kb' }));
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'web/dist')));

app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.path.startsWith('/api') &&
    !req.path.startsWith('/uploads') &&
    !fs.existsSync(path.join(__dirname, 'web/dist', req.path))
  ) {
    res.sendFile(path.join(__dirname, 'web/dist', 'index.html'));
  } else {
    next();
  }
});

app.use('/api/menus', menuRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/users', userRoutes);
app.use('/api', toolRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: '服务器暂时无法处理该请求' });
});

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
