/**
 * Created by sward on 8/3/2017.
 */
var common = require('../common/controller');
var script = require('../common/scriptController');
var coxCtrl = require('./coxController');
var calibrus = require('../calibrus/calibrusController');

var express = require('express');
var router = express.Router();
var config = require('../../config.js')
var sqlConnection = config.database.cox;
var sql = require('mssql');
var sqlCalibrusConnection = config.database.calibrus;

router.use(function (req, res, next) {
    if (!(req.jwt && (req.jwt.companyName === 'calibrus' || req.jwt.companyName === 'cox' ))) {
        res.status(401).json();
        return res.end();
    }
    next();
});

var connectionCox = new sql.ConnectionPool(sqlConnection, function (err) {
    // console.log(err)

});

var connectionCalibrus = new sql.ConnectionPool(sqlCalibrusConnection, function (err) {
    // console.log(err)
});

router.post('/addaccount',function(req,res){
    // libertyCtrl.validation(connectionLiberty,req,res,config)
    coxCtrl.addAccount(connectionCox,req,res)
})

module.exports = router;