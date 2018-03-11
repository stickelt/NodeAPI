var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var errorhandler = require('errorhandler');
var config = require('./config.js');

var app = express();
var env = app.get('env');

if ('development' === env) {
    app.use(morgan('dev'));
    app.use(errorhandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.set('view options', {
        pretty: true
    });
}

if ('prod' === env) {
    app.use(morgan('tiny'));
    app.use(errorhandler({
        dumpExceptions: false,
        showStack: false
    }));
}

// Mongo
var mongojs = require('mongojs');
var collections = ['TPV', 'scripts', 'Cox', 'DailyStats', 'WeeklyStats', 'MonthlyStats', 'User'];
app.db = mongojs(config.mongo, collections);

app.db.on('error', function (err) {
    console.log('database error', err)
});

app.db.on('connect', function () {
    console.log(app.db)
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


// JWT
app.set('jwtSecret', config.secret);
app.use(function (req, res, next) {
    if (req.headers && req.headers.authorization) {
        var token = req.headers.authorization.replace(/.*?Bearer\s/, '');
        var secret = app.get('jwtSecret');
        try {
            req.jwt = jwt.verify(token, secret);
        } catch (err) {
            res.status(401).json({message:err.name});
            return res.end();
        }
    }
    next();
});


require('./connectionPools')(app);
require('./routes')(app);

module.exports = app;
