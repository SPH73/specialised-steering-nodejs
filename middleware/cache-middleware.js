const { options } = require('../routes/dynamic');

let setCache = function (req, res, next) {
    // here you can define period in second, this one is 5 minutes
    const options = {
        etag: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    };

    // only cache GET requests
    if (req.method == 'GET') {
        res.set('Cache-control', 'public', options);
    } else {
        // for the other requests set strict no caching parameters
        res.set('Cache-control', `no-store`);
    }

    // remember to call next() to pass on the request
    next();
};

// now call the new middleware function in your app

module.exports = setCache;
