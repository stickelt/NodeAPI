'use strict';

module.exports = function (app) {
    app.use('/api/auth', require('./api/auth/index'));

    app.use('/api/spark', require('./api/spark'));
    app.use('/api/clearview', require('./api/clearview'));
    app.use('/api/champion', require('./api/champion'));
    // app.use('/api/constellation', require('./api/constellation'));
    // app.use('/api/google', require('./api/google'));
    app.use('/api/liberty', require('./api/liberty'));
    app.use('/api/frontier', require('./api/frontier'));
    app.use('/api/cox', require('./api/cox'))
    app.use('/api/calibrus', require('./api/calibrus'));
    app.use('/api/centurytel', require('./api/centurytel'));

    // All other routes should result in a 404
    app.route('/*').get(function (req, res) {
        res.status(404).json();
        res.end();
    });
};