const express = require('express');

const router = express.Router();

router.get('/about', function (req, res) {
    res.render('about');
});

router.get('/terms', function (req, res) {
    res.render('terms');
});

router.get('/disclaimer', function (req, res) {
    res.render('terms');
});

module.exports = router;
