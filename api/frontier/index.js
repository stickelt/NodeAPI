/**
 * Created by sward on 5/3/2017.
 */
'use strict';
    var common = require('../common/controller');
    var frontierCtrl = require('./frontierController');
    var frontier = require('./config');
    var express = require('express');
    var router = express.Router();
    var config = require('../../config.js')
    var sqlConnection = config.database.frontier;
    var sql = require('mssql');

    var connection = new sql.ConnectionPool(sqlConnection, function (err) {
       // console.log(err)
    })

router.use(function (req, res, next) {
    if (!(req.jwt && (req.jwt.companyName === 'calibrus' ))) {
        res.status(401).json();
        return res.end();
    }
    next();
});

    router.get('/customer/:tn', function(req,res){
        var tn = req.params.tn;
        frontierCtrl.getCustomer(connection,tn,req,res)
    });
    
    router.put('/customerUpdate', function(req,res){
        frontierCtrl.customerUpdate(connection,req,res);
    })

    router.get('/main/:mainid',function(req,res){
    common.getmain(connection,req,res,spark.btn);
    });

    router.get('/btn/:btn',function(req,res){
        var btn = req.params.btn;
      //  console.log(btn)
        common.btnCheck(connection,btn,req,res,spark.btn)
    })

    router.post('/question',function(req,res){
        common.createQuestion(connection,req,res)
    })

module.exports = router ;
