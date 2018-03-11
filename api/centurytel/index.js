var express = require('express');
var router = express.Router();
var config = require('../../config.js')
var sqlConnection = config.database.centurytel;
var sql = require('mssql');

var centuryTelCtrl = require('./CenturyTelController');

var connectionCenturyTel = new sql.ConnectionPool(sqlConnection, function (err) {
    // console.log(err)
});

router.use(function (req, res, next) {
    if (!(req.jwt && (req.jwt.companyName.toLowerCase() === 'calibrus' || req.jwt.companyName.toLowerCase() === 'centurytel' ))) {
        res.status(401).json();
        return res.end();
    }
    next();
});

router.post('/tpvnewtn', function(req,res){
    centuryTelCtrl.loadnewtpv(connectionCenturyTel,req,res) ;
} )

module.exports = router;