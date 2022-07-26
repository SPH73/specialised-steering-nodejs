require('dotenv').config();

const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const path = require('path');

const errorsHandlerMiddleware = require('./middleware/error-handler');

const dynamicRoutes = require('./routes/dynamic');
const defaultRoutes = require('./routes/default');

const PORT = process.env.PORT || 3300;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(compression());
app.use(
  express.static('public', {
    etag: true,
    maxAge: 31536000000,
    lastModified: true,
  }),
);
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Routes
app.use(dynamicRoutes);
app.use(defaultRoutes);

// app.use(errorsHandlerMiddleware.handleServerError);
// app.use(errorsHandlerMiddleware.handleNotFoundError);

app.use((req, res, next) => {
  res.status(404).render('404');
});
app.use((error, req, res, next) => {
  res.status(500).render('500');
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(__dirname);
  console.log(`http://localhost:${PORT}`);
});
