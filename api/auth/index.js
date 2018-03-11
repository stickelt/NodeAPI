'use strict';

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../../config.js')
var sqlConnection = config.database.calibrus;
var sql = require('mssql');
var calibrusCtrl = require('../calibrus/calibrusController');

var connectionCalibrus = new sql.ConnectionPool(sqlConnection, function (err) {
    // console.log(err)
});

router.post('/', function (req, res) {
    var query = req.body.user


    var db = req.app.db;

    db.User.findOne(query, function (err, data) {
        if (err) return res.json(err);

        var payload = {companyName: data.companyName, permission: data.permission}
        var secret = req.app.get('jwtSecret');

        if (data && data.permission === 'admin') {
            var token = jwt.sign(payload, secret, {expiresIn: '365d'});
            res.json({jwt: token})
        } else {
            res.json({"error": "Not a valid user"});
        }
    });
});

router.get('/getclienttoken/:client', function (req, res) {
    calibrusCtrl.getClientToken(req, res)
});


module.exports = router;