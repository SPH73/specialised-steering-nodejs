const db = require('../data/db');

const auth = async (req, res, next) => {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  if (!user || !isAuth) {
    return next();
  }

  const userDoc = await db
    .getDb()
    .collection('staff')
    .findOne({ _id: user.id });

  const isAdmin = userDoc.isAdmin;

  res.locals.isAdmin = isAdmin;
  res.locals.isAuth = isAuth;

  next();
};

module.exports = auth;
