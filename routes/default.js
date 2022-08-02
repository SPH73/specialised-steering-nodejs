const express = require('express');

const router = express.Router();

router.get('/about', (req, res) => {
  const meta = {
    title:
      'Hydraulic Repairs to OEM Specification and Component Sourcing Service - Germiston, Gauteng',
    description:
      'Specialised Steering CC offer hydraulic repairs services and a service exchange on some hydraulic components from our Germiston OEM repair workshop as well as on-site in underground and open pit mines.',
  };
  res.render('about', { meta: meta });
});

router.get('/disclaimer', (req, res) => {
  const meta = {
    title: 'SPECIALISED STEERING CC',
  };
  res.render('disclaimer', { meta: meta });
});

router.get('/cookie-policy', (req, res) => {
  const meta = {
    title: 'Cookie Policy',
  };
  res.render('cookie-policy', { meta: meta });
});

router.post('/__cspreport__', (req, res) => {
  console.log(req.body);
});

module.exports = router;
