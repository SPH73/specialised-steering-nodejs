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

app.use((req, res, next) => {
  res.setHeader(
    'Report-To',
    '{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"http://192.168.0.12:3300/__cspreport__"}],"include_subdomains":true}',
  );
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; font-src 'self'; img-src 'self' https://res.cloudinary.com https://sswebimages.mo.cloudinary.net; script-src 'self' 'unsafe-inline' https://ajax.googleapis.com https://d3e54v103j8qbb.cloudfront.net 'sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0='; style-src 'self' 'unsafe-inline'; frame-src 'self'",
  );
  next();
});

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
