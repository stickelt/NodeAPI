/**
 * Created by sward on 5/3/2017.
 */
'use strict';

//<editor-fold Declaration region>

var common = require('../common/controller')
var script = require('../common/scriptController');
var sparkCtrl = require('./sparkController');
var calibrus = require('../calibrus/calibrusController');
var portalCtrl = require('../common/portalController');


var express = require('express');
var router = express.Router();
var config = require('../../config.js')
var sqlConnection = config.database.spark;
var sql = require('mssql');
var sqlCalibrusConnection = config.database.calibrus;

var connectionSpark = new sql.ConnectionPool(sqlConnection, function (err) {
});

var connectionCalibrus = new sql.ConnectionPool(sqlCalibrusConnection, function (err) {
});

//</editor-fold>

//<editor-fold Middleware region>

router.use(function (req, res, next) {
    if (!(req.jwt && (req.jwt.companyName === 'calibrus' || req.jwt.companyName === 'spark' ))) {
        res.status(401).json();
        return res.end();
    }
    next();
});

//</editor-fold>

//<editor-fold Spark specific region>

router.post('/validation', function (req, res) {
    sparkCtrl.validation(connectionSpark, req, res, config)
});

// router.get('/marketstate', function (req, res) {
//     sparkCtrl.getMarketState(connectionSpark, req, res);
// });
//
// router.get('/utilitiesstate/:state', function (req, res) {
//     sparkCtrl.getUtilitiesByState(connectionSpark, req, res);
// });

router.get('/programsstate/:state/:vendor', function (req, res) {
    sparkCtrl.getProgramsByStateAndVendor(connectionSpark, req, res);
});

// router.get('/marketutility/:id', function (req, res) {
//     sparkCtrl.getMarketUtility(connectionSpark, req, res);
// });
//
// router.get('/marketproduct/:id', function (req, res) {
//     sparkCtrl.getMarketProduct(connectionSpark, req, res);
// });

router.get('/questiondirectives/:id', function (req, res) {
    sparkCtrl.getQuestionDirectives(connectionSpark, req, res);
});

router.post('/savetpv', function (req, res) {
    sparkCtrl.savetpv(req, res)
});

router.get('/getstatebyzip/:zipcode', function (req, res) {
    common.getStateByZip(connectionSpark, '', req, res)
})

router.get('/questions', function (req, res) {
    script.getQuestions(connectionSpark, req, res);
});

//</editor-fold>

//<editor-fold Common region>

router.get('/validateAgent/:id',function(req,res){
    common.getvalidAgent(connectionSpark, req, res);
});

router.get('/main/:mainid', function (req, res) {
    var mainid = req.params.mainid;
    common.getmain(connectionSpark, mainid, req, res);
});

router.get('/btn/:btn', function (req, res) {
    var btn = req.params.btn;
    common.btnCheck(connectionSpark, btn, req, res);
});

router.get('/states', function (req, res) {
    common.getStates(connectionSpark, req, res);
});

router.get('/saleschannel', function (req, res) {
    common.getSalesChannel(connectionSpark, req, res);
});

router.get('/admin', function (req, res) {
    common.getAllDnis(connectionSpark, req, res);
});

router.post('/admin', function(req, res){
    common.createUpdateDnis(connectionSpark,req, res)
});

router.delete('/admin/:id', function(req, res){
    common.deleteDnis(connectionSpark,req, res)
});

router.get('/saleschannels', function(req, res){
    common.getAllSalesChannels(connectionSpark,req, res)
});

//</editor-fold>

//<editor-fold Script region>

router.get('/questions', function (req, res) {
    script.getQuestions(connectionSpark, req, res);
});

router.post('/question', function (req, res) {
    script.createQuestion(connectionSpark, req, res);
});

router.get('/directives', function (req, res) {
    script.getQuestionDirectives(connectionSpark, req, res);
});

router.put('/question', function (req, res) {
    script.ModifyQuestion(connectionSpark, req, res);
});

router.get('/scriptquestions/:statecode/:saleschannelid', function (req, res) {
    script.getScriptQuestions(connectionSpark, req, res);
});

router.get('/scriptquestionsadmintool/:statecode/:saleschannelid', function (req, res) {
    script.getScriptQuestionsForAdmin(connectionSpark, req, res);
});

router.post('/scriptquestion', function (req, res) {
    script.createScriptQuestion(connectionSpark, req, res);
});

router.put('/scriptquestion', function (req, res) {
    script.ModifyScriptQuestion(connectionSpark, req, res);
});

router.get('/directiveassoc/:questionid', function (req, res) {
    script.getDirectiveAssoc(connectionSpark, req, res);
});

router.post('/directiveassoc', function(req,res){
    script.insertDirectiveAssoc(connectionSpark,req,res)
});

router.put('/directiveassoc', function(req,res){
    script.updateDirectiveAssoc(connectionSpark,req,res)
});

router.delete('/directiveassoc/:id', function(req,res){
    script.deleteDirectiveAssoc(connectionSpark,req,res)
});

//</editor-fold>

//<editor-fold Calibrus region>

router.get('/getdispositions',function(req,res){
    calibrus.getDispositions(connectionCalibrus,req,res)
});

// portal endpoints
router.get('/dashboard', function(req, res) {
    portalCtrl.getDashboard(connectionSpark, req, res);
});


module.exports = router;
