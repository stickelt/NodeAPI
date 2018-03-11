'use strict';

var calibrusCtrl = require('./calibrusController');
var common = require('../common/controller');

var express = require('express');
var router = express.Router();
var config = require('../../config.js')
var sqlConnection = config.database.calibrus;
var sql = require('mssql');
var jwt = require('jsonwebtoken')

var connectionCalibrus = new sql.ConnectionPool(sqlConnection, function (err) {
   if(err) console.log(err);
});

// Going with ".use" because ALL ROUTES below require auth.
router.use(function (req, res, next) {

    if (!(req.jwt && req.jwt.companyName === 'calibrus')) {
        res.status(401).json(jwt);
        return res.end();
    }
    next();
});

router.post('/escape',
    calibrusCtrl.escape );

router.get('/aggregates/:startdate/:enddate', calibrusCtrl.loadAggregates );

router.get('/clients', calibrusCtrl.getClients)

router.get('/dailys/:client', calibrusCtrl.getDailys)

router.get('/weeklys/:client', calibrusCtrl.getWeeklys);


router.get('/monthlys/:client', calibrusCtrl.getMonthlys)

router.get('/calibrusapplog', function (req, res) {
    calibrusCtrl.getCalibrusAppLog(connectionCalibrus, req, res);
});

router.get('/dnis/:dnis', common.getDNIS)

router.post('/createuser', calibrusCtrl.createUser )

router.get('/billing/:startdate/:enddate', function (req, res) {
    var obj = {}
    obj.StartDate = req.params.startdate
    obj.EndDate = req.params.enddate
    obj.Ids = '2'

    common.report(connectionCalibrus, req, res, obj)
})

router.get('/getstatebyzip/:zipcode', function (req, res) {
    common.getStateByZip('', '', req, res)
})

router.get('/appbilling/:startdate/:enddate', function (req, res) {
    calibrusCtrl.getBillingData(req, res,connectionCalibrus)
})

router.post('/authenticateuser', function (req, res) {
    calibrusCtrl.authenticateUser(connectionCalibrus, req, res)
})

module.exports = router;