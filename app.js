require('dotenv').config({ path: './config.env' });

const express = require('express');
const session = require('express-session');

const csrf = require('csurf');

const sessionConfig = require('./utils/session');
const db = require('./data/db');

const path = require('path');

const dynamicRoutes = require('./routes/dynamic');
const defaultRoutes = require('./routes/default');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth-middleware');

const mongodbSessionStore = sessionConfig.createSessionStore(session);

const app = express();

const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Middleware
// Sessions config
app.use(session(sessionConfig.createSessionConfig(mongodbSessionStore)));
// middleware security
// **TODO CSRF
// Auth
app.use(authMiddleware);

// Routes
app.use(dynamicRoutes);
app.use(defaultRoutes);
app.use(authRoutes);

// TODO - uncomment out before production
// // handle Errors
// app.use((req, res) => {
//     res.status(404).render('404');
// });

// app.use((error, req, res, next) => {
//     res.status(500).render('500');
// });

// Connect to MongoDB when the server starts
db.connectToDatabase(function (err) {
    if (err) {
        console.error(err);
        process.exit();
    }

    // start the Express server
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
        console.log('http://localhost:3000');
    });
});
