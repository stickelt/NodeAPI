/**
 * Created by sward on 5/3/2017.
 */
'use strict';

//<editor-fold Declaration region>

var common = require('../common/controller')
var script = require('../common/scriptController');
var clearviewCtrl = require('./clearviewController');
var calibrus = require('../calibrus/calibrusController');
var portalCtrl = require('../common/portalController');


var express = require('express');
var router = express.Router();
var config = require('../../config.js')
var sqlConnection = config.database.clearview;
var sql = require('mssql');
var sqlCalibrusConnection = config.database.calibrus;

var connectionClearview = new sql.ConnectionPool(sqlConnection, function (err) {
});

var connectionCalibrus = new sql.ConnectionPool(sqlCalibrusConnection, function (err) {
});

//</editor-fold>

//<editor-fold Middleware region>

router.use(function (req, res, next) {
    if (!(req.jwt && (req.jwt.companyName === 'calibrus' || req.jwt.companyName === 'clearview' ))) {
        res.status(401).json();
        return res.end();
    }
    next();
});

//</editor-fold>

//<editor-fold Spark specific region>

router.post('/validation', function (req, res) {
    clearviewCtrl.validation(connectionClearview, req, res, config)
});

// router.get('/marketstate', function (req, res) {
//     sparkCtrl.getMarketState(connectionClearview, req, res);
// });
//
// router.get('/utilitiesstate/:state', function (req, res) {
//     sparkCtrl.getUtilitiesByState(connectionClearview, req, res);
// });

router.get('/programsstate/:state/:vendor', function (req, res) {
    clearviewCtrl.getProgramsByStateAndVendor(connectionClearview, req, res);
});

// router.get('/marketutility/:id', function (req, res) {
//     sparkCtrl.getMarketUtility(connectionClearview, req, res);
// });
//
// router.get('/marketproduct/:id', function (req, res) {
//     sparkCtrl.getMarketProduct(connectionClearview, req, res);
// });

router.get('/questiondirectives/:id', function (req, res) {
    clearviewCtrl.getQuestionDirectives(connectionClearview, req, res);
});

router.post('/savetpv', function (req, res) {
    clearviewCtrl.savetpv(connectionClearview, req, res)
});

router.get('/getstatebyzip/:zipcode', function (req, res) {
    common.getStateByZip(connectionClearview, '', req, res)
})

router.get('/questions', function (req, res) {
    script.getQuestions(connectionClearview, req, res);
});

//</editor-fold>

//<editor-fold Common region>

router.get('/validateAgent/:id',function(req,res){
    common.getvalidAgent(connectionClearview, req, res);
});

router.get('/main/:mainid', function (req, res) {
    var mainid = req.params.mainid;
    common.getmain(connectionClearview, mainid, req, res);
});

router.get('/btn/:btn', function (req, res) {
    var btn = req.params.btn;
    common.btnCheck(connectionClearview, btn, req, res);
});

router.get('/states', function (req, res) {
    common.getStates(connectionClearview, req, res);
});

router.get('/saleschannel', function (req, res) {
    common.getSalesChannel(connectionClearview, req, res);
});

router.get('/admin', function (req, res) {
    common.getAllDnis(connectionClearview, req, res);
});

router.post('/admin', function(req, res){
    common.createUpdateDnis(connectionClearview,req, res)
});

router.delete('/admin/:id', function(req, res){
    common.deleteDnis(connectionClearview,req, res)
});

router.get('/saleschannels', function(req, res){
    common.getAllSalesChannels(connectionClearview,req, res)
});

//</editor-fold>

//<editor-fold Script region>

router.get('/questions', function (req, res) {
    script.getQuestions(connectionClearview, req, res);
});

router.post('/question', function (req, res) {
    script.createQuestion(connectionClearview, req, res);
});

router.get('/directives', function (req, res) {
    script.getQuestionDirectives(connectionClearview, req, res);
});

router.put('/question', function (req, res) {
    script.ModifyQuestion(connectionClearview, req, res);
});

router.get('/scriptquestions/:statecode/:saleschannelid', function (req, res) {
    script.getScriptQuestions(connectionClearview, req, res);
});

router.get('/scriptquestionsadmintool/:statecode/:saleschannelid', function (req, res) {
    script.getScriptQuestionsForAdmin(connectionClearview, req, res);
});

router.post('/scriptquestion', function (req, res) {
    script.createScriptQuestion(connectionClearview, req, res);
});

router.put('/scriptquestion', function (req, res) {
    script.ModifyScriptQuestion(connectionClearview, req, res);
});

router.get('/directiveassoc/:questionid', function (req, res) {
    script.getDirectiveAssoc(connectionClearview, req, res);
});

router.post('/directiveassoc', function(req,res){
    script.insertDirectiveAssoc(connectionClearview,req,res)
});

router.put('/directiveassoc', function(req,res){
    script.updateDirectiveAssoc(connectionClearview,req,res)
});

router.delete('/directiveassoc/:id', function(req,res){
    script.deleteDirectiveAssoc(connectionClearview,req,res)
});

//</editor-fold>

//<editor-fold Calibrus region>

router.get('/getdispositions',function(req,res){
    calibrus.getDispositions(connectionCalibrus,req,res)
});

router.post('/createmappingrecords', function (req, res) {
    calibrus.createMappingRecords(req, res);
});

router.get('/getmappingrecords', function (req, res) {
    calibrus.getMappingRecords(req, res, 'Clearview');
});


// portal endpoints
router.get('/dashboard', function(req, res) {
    portalCtrl.getDashboard(connectionClearview, req, res);
});


module.exports = router;
