'use strict';
    var common = require('../common/controller')
    var script = require('../common/scriptController')

    var express = require('express');
    var router = express.Router();
    var config = require('../../config.js')
    var sqlConnection = config.database.champion;
    var sql = require('mssql');

    var connection = new sql.ConnectionPool(sqlConnection, function (err) {
       // console.log(err)
    })

router.use(function (req, res, next) {
    if (!(req.jwt && (req.jwt.companyName === 'calibrus' || req.jwt.companyName === 'champion' ))) {
        res.status(401).json();
        return res.end();
    }
    next();
});

    router.get('/questions', function(req, res){
        script.getQuestions(connection, req, res);
    });

    router.post('/question', function(req,res){
        script.createQuestion(connection,req,res) ;
    })

    router.put('/question', function(req,res){
        script.ModifyQuestion(connection,req,res);
    })

    router.get('/scriptquestions/:statecode/:saleschannelid', function(req,res){
        script.getScriptQuestions(connection,req,res);
    })

    router.post('/scriptquestion',function(req,res){
        script.createScriptQuestion(connection,req,res);
    })

    router.get('/main',function(req,res){
    common.getmain(connection,req,res);
    });

    router.get('/btn/:btn',function(req,res){
        var btn = req.params.btn;
      //  console.log(btn)
        common.btnCheck(connection,btn,req,res)
    })

    router.post('/question',function(req,res){
        common.createQuestion(connection,req,res)
    })



module.exports = router;


