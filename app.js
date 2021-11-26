const express = require('express');

const path = require('path');

const dynamicRoutes = require('./routes/dynamic');
const defaultRoutes = require('./routes/default');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use('/', dynamicRoutes);
app.use('/', defaultRoutes);

// handle Errors
app.use(function (req, res) {
    res.render('404');
});

app.use(function (error, req, res, next) {
    res.render('500');
});
app.listen(3000);
