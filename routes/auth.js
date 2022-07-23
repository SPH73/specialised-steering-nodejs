require('dotenv').config({ path: '../config.env' });

const express = require('express');
const bcrypt = require('bcryptjs');

const db = require('../data/db');

const router = express.Router();

router.post('/logout', (req, res) => {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect('/');
});

router.get('/401', (req, res) => {
  console.log('****** route for 401 reached!');
  res.render('401');
});

router.get('/register', (req, res) => {
  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: '',
      confirmEmail: '',
      password: '',
    };
  }
  req.session.inputData = null;
  res.render('register', {
    inputData: sessionInputData,
  });
});

router.post('/register', async (req, res, next) => {
  const userData = req.body;
  const email = userData.email;
  const confirmEmail = userData['confirm-email'];
  const password = userData.password;
  const hashedPwd = await bcrypt.hash(password, 12);

  if (
    !email ||
    !confirmEmail ||
    !password ||
    password.trim() < 6 ||
    email !== confirmEmail ||
    !email.includes('@')
  ) {
    req.session.inputData = {
      hasError: true,
      message: 'Invalid input, please check your data',
      email: email,
      confirmEmail: confirmEmail,
      password: password,
    };

    req.session.save(() => {
      res.redirect('/register');
    });
    return;
  }
  try {
    const existingUser = await db
      .getDb()
      .collection('staff')
      .findOne({ email: email });

    if (existingUser) {
      req.session.inputData = {
        hasError: true,
        message: 'User exists already!',
        email: email,
        confirmEmail: confirmEmail,
        password: password,
      };

      req.session.save(() => {
        res.redirect('/register');
      });
      return;
    }
  } catch (error) {
    console.error(error);
    next(error);
    return;
  }

  const user = {
    email: email,
    password: hashedPwd,
  };
  await db.getDb().collection('staff').insertOne(user);
  res.redirect('/login');
});

router.get('/login', (req, res) => {
  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: '',
      password: '',
    };
  }
  req.session.inputData = null;
  res.render('login', { inputData: sessionInputData });
});

router.post('/login', async (req, res, next) => {
  const userData = req.body;
  const email = userData.email;
  const password = userData.password;

  let existingUser;

  try {
    existingUser = await db
      .getDb()
      .collection('staff')
      .findOne({ email: email });
  } catch (error) {
    next(error);
    return;
  }

  if (!existingUser) {
    req.session.inputData = {
      hasError: true,
      message: 'Could not log you in - please check your credentials!',
      email: email,
      password: password,
    };

    req.session.save(() => {
      res.redirect('/login');
    });
    return;
  }

  const pwdsAreEqual = await bcrypt.compare(password, existingUser.password);
  if (!pwdsAreEqual) {
    req.session.inputData = {
      hasError: true,
      message: 'Could not log you in - please check your credentials!',
      email: email,
      password: password,
    };

    req.session.save(() => {
      res.redirect('/login');
    });
    return;
  }

  req.session.user = { id: existingUser._id, email: existingUser.email };
  req.session.isAuthenticated = true;
  req.session.save(() => {
    res.redirect('/');
  });
});

module.exports = router;
