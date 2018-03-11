'use strict';
var common = require('../common/controller');
var script = require('../common/scriptController');
var libertyCtrl = require('./libertyController');
var calibrus = require('../calibrus/calibrusController');
var portalCtrl = require('../common/portalController');
var libertyConfig = require('./config')
// var test = require('./test')


var express = require('express');
var router = express.Router();
var config = require('../../config.js')
var sqlConnection = config.database.liberty;
var sql = require('mssql');
var sqlCalibrusConnection = config.database.calibrus;

router.use(function (req, res, next) {
    if (!(req.jwt && (req.jwt.companyName === 'calibrus' || req.jwt.companyName === 'liberty'))) {
        res.status(401).json();
        return res.end();
    }
    next();
});

var connectionLiberty = new sql.ConnectionPool(sqlConnection, function (err) {
    // console.log(err)

});

var connectionCalibrus = new sql.ConnectionPool(sqlCalibrusConnection, function (err) {
    // console.log(err)
});


router.post('/validation', function (req, res) {
    // libertyCtrl.validation(connectionLiberty,req,res,config)
    libertyCtrl.validation(connectionLiberty, req, res, config)
})

router.get('/getstatebyzip/:zipcode', function (req, res) {
    common.getStateByZip(connectionLiberty, '', req, res)
})

router.get('/questions', function (req, res) {
    script.getQuestions(connectionLiberty, req, res);
});


router.get('/marketstate', function (req, res) {
    libertyCtrl.getMarketState(connectionLiberty, req, res);
});

router.get('/utilitiesstate/:state', function (req, res) {
    libertyCtrl.getUtilitiesByState(connectionLiberty, req, res);
});

router.get('/programsstate/:state/:vendor', function (req, res) {
    libertyCtrl.getProgramsByStateAndVendor(connectionLiberty, req, res);
});

router.get('/marketutility/:id', function (req, res) {
    libertyCtrl.getMarketUtility(connectionLiberty, req, res);
});

router.get('/marketproduct/:id', function (req, res) {
    libertyCtrl.getMarketProduct(connectionLiberty, req, res);
});

router.post('/question', function (req, res) {
    console.log('question post', req)
    script.createQuestion(connectionLiberty, req, res);
});

router.get('/directives', function (req, res) {
    console.log('get directives');
    script.getQuestionDirectives(connectionLiberty, req, res);
});

router.get('/questiondirectives/:id', function (req, res) {
    libertyCtrl.getQuestionDirectives(connectionLiberty, req, res);
});

router.get('/validateAgent/:id', function (req, res) {
    //  console.log('api about to call getvalidAgent');
    common.getvalidAgent(connectionLiberty, req, res);
});


router.put('/question', function (req, res) {
    script.ModifyQuestion(connectionLiberty, req, res);
});


router.get('/scriptquestions/:statecode/:saleschannelid', function (req, res) {
    script.getScriptQuestions(connectionLiberty, req, res);
});


router.get('/scriptquestionsadmintool/:statecode/:saleschannelid', function (req, res) {
    script.getScriptQuestionsForAdmin(connectionLiberty, req, res);
});

router.post('/scriptquestion', function (req, res) {
    script.createScriptQuestion(connectionLiberty, req, res);
});

router.put('/scriptquestion', function (req, res) {
    script.ModifyScriptQuestion(connectionLiberty, req, res);
});

router.get('/main/:mainid', function (req, res) {
    var mainid = req.params.mainid;
    common.getmain(connectionLiberty, mainid, req, res);
});

router.get('/btn/:btn', function (req, res) {
    var btn = req.params.btn;
    //  console.log(btn)
    common.btnCheck(connectionLiberty, btn, req, res);
})

router.post('/question', function (req, res) {
    common.createQuestion(connectionLiberty, req, res);
})

router.get('/states', function (req, res) {
    common.getStates(connectionLiberty, req, res);
});

router.get('/directiveassoc/:questionid', function (req, res) {
    console.log('get directiveassoc');
    script.getDirectiveAssoc(connectionLiberty, req, res);
});

router.post('/directiveassoc', function (req, res) {
    script.insertDirectiveAssoc(connectionLiberty, req, res)
})

router.put('/directiveassoc', function (req, res) {
    script.updateDirectiveAssoc(connectionLiberty, req, res)
})

router.delete('/directiveassoc/:id', function (req, res) {
    script.deleteDirectiveAssoc(connectionLiberty, req, res)
})

router.get('/saleschannel', function (req, res) {
    common.getSalesChannel(connectionLiberty, req, res);
});

router.get('/vendors', function (req, res) {
    common.getAllVendors(connectionLiberty, req, res);
});

router.get('/offices', function (req, res) {
    common.getAllOffices(connectionLiberty, req, res);
});

router.get('/admin', function (req, res) {
    common.getAllDnis(connectionLiberty, req, res);
});

router.post('/admin', function (req, res) {
    common.createUpdateDnis(connectionLiberty, req, res)
})

router.get('/vendors/:id', function (req, res) {
    common.getVendor(connectionLiberty, req, res)
});

router.delete('/admin/:id', function (req, res) {
    common.deleteDnis(connectionLiberty, req, res)
})

router.get('/saleschannels', function (req, res) {
    common.getAllSalesChannels(connectionLiberty, req, res)
})

router.post('/savetpv', function (req, res) {
    libertyCtrl.savetpv(req, res)
})

router.get('/getdispositions', function (req, res) {
    calibrus.getDispositions(connectionCalibrus, req, res)
})

//Below is for Liberty Portal

router.get('/verifiedchart/:range/:vendorId/:officeId', function (req, res) {
    console.log('get verifiedchart');
    libertyCtrl.getVerifiedchart(connectionLiberty, req, res);
});

router.get('/getdispositions', function (req, res) {
    console.log('get getdispositions');
    libertyCtrl.getDispositions(connectionLiberty, req, res);
});

router.post('/getcallsearchreport', function (req, res) {
    libertyCtrl.getCallSearchReport(req, res)
});

// portal endpoints
router.get('/dashboard', function(req, res) {
    portalCtrl.getDashboard(connectionLiberty, req, res);
});



module.exports = router;