const express = require('express');

const router = express.Router();

router.get('/about', (req, res) => {
    const meta = {
        title: 'ABOUT SEGURO HYDRAULICS - Johannesburg',
        description:
            'Seguro Hydraulics (Pty) Ltd supports the industries we serve by providing a platform to bridge the gap between manufacturers and end-users of hydraulic componentry.',
    };
    res.render('about', { meta: meta });
});

router.get('/disclaimer', (req, res) => {
    res.render('disclaimer');
});

module.exports = router;
