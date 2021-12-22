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
    const csrfToken = req.csrfToken();
    res.render('register', {
        inputData: sessionInputData,
        csrfToken: csrfToken,
    });
});

router.post('/register', async (req, res) => {
    const userData = req.body;
    const email = userData.email;
    const confirmEmail = userData['confirm-email'];
    const password = userData.password;
    const hashedPwd = await bcrypt.hash(password, 12);
    console.log('****** req received', userData, hashedPwd);

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
    }

    const user = {
        email: email,
        password: hashedPwd,
    };
    console.log('****** attempting to connect to db.....');
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
    const csrfToken = req.csrfToken();
    res.render('login', { inputData: sessionInputData, csrfToken: csrfToken });
});

router.post('/login', async (req, res) => {
    const userData = req.body;
    const email = userData.email;
    const password = userData.password;

    const existingUser = await db
        .getDb()
        .collection('staff')
        .findOne({ email: email });

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
        res.redirect('/dashboard');
    });
});

module.exports = router;