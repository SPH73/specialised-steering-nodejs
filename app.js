require('dotenv').config();

const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const path = require('path');

const cookieParser = require('cookie-parser');

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
    `{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"http://192.168.0.12:${PORT}/__cspreport__"}],"include_subdomains":true}`,
  );
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; font-src 'self'; img-src 'self' https://cdn-cookieyes.com https://dl.airtable.com https://res.cloudinary.com https://sswebimages.mo.cloudinary.net; script-src 'self' 'unsafe-inline' https://cdn-cookieyes.com https://region1.google-analytics.com/ https://google.com https://www.gstatic.com https://www.googletagmanager.com https://ajax.googleapis.com https://d3e54v103j8qbb.cloudfront.net; style-src 'self' 'unsafe-inline'; frame-src 'self' https://cdn-cookieyes.com https://www.google.com; connect-src 'self' https://active.cookieyes.com/api/fc1fd1fcf281525614c1466b/log https://log.cookieyes.com https://cdn-cookieyes.com https://region1.google-analytics.com/; script-src-elem 'self' 'unsafe-inline' https://cdn-cookieyes.com https://www.google.com https://www.googletagmanager.com https://www.gstatic.com https://ajax.googleapis.com https://d3e54v103j8qbb.cloudfront.net",
  );
  res.setHeader('set-cookie', [
    'SNID=AKJei18cI6WrM82pnZzz5bXsN4Aul10GZ3sC0o_ZPK5at2tHIAXWpuG3W7xgPLwfcdRC2sF6s43Cu60412fN5ylnfLCdZw; SameSite=None; Secure; Domain=.google.com; Path=/verify',
    'AEC=AakniGOnSxOtqUQLtCr7imMV6bR3dXbC_Fd; SameSite=None; Secure; Domain=.google.com;',
    'NID=aKWcrH3dIdnZ6mJO4dWg9XQJer6RCHDIwGgMoLIMYHX9ua0dZX1ZdgeFzXmPenarKZcsLb108659qesfw2ggSyWSqTjtwiyuMJhAjDNP818yxetcx2eWz; SameSite=None; Secure; Domain=.google.com',
    '_GRECAPTCHA=09AMjm62WAYKsXsUwOoRyF; SameSite=None; Secure; Domain=www.google.com; Path=/recaptcha',
  ]);
  next();
});

app.use(cookieParser());

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
