(function () {
    'use strict';
    var sql = require('mssql');
    var common = require('../common/controller');
    var config = require('../../config.js');
    var mongojs = require('mongojs');
    var collections = ['libertyTPV', 'ClientConfirmationNumber'];
    var db = mongojs(config.mongo, collections);
    var moment = require('moment');
    var isodate  = require('isodate');
    var moment = require('moment-timezone')

    /* ====== LIBERTY SPECIFIC ======================

       Date:   7/17/2017 
       Notes:
       License:   Calibrus
    */
    exports.validation = function (connection, req, res,config) {
        var qObj = req.body;
        //console.log('qObj', qObj)
        qObj.directiveAnswers.forEach(function(r){
            if(r.objName){
                qObj[r.objName] = r.response ;
                console.log(qObj[r.objName])
            }
        });

        switch(qObj.questionId) {
            case 2:
                common.officeByName(connection,qObj.OfficeName,req,res);
                break;
            case 161:
                //console.log(qObj)
                common.getStateByZip(connection,qObj.ServiceAddress,req,res);
                break;
            case  4:
                common.btnCheck(connection,qObj.BTN,req,res,config.btn);
                break;

            default:
                res.json({"Default":{html:"No validation for this question Id " + qObj.questionId}})
        }
    };

    exports.getMarketUtility = function (connection, req, res) {
        var request = new sql.Request(connection);
        request.input('Id', sql.Int, req.params.id);
        var query = 'SELECT * FROM [Liberty].[v1].[MarketUtility] ' +
            ' WHERE Active = 1 AND IsElectric = 1 ' +    // IsGas = 1 
            ' AND MarketStateId = @Id';
        request.query(query).then(function (resultset) {
            console.log(resultset.recordset);
            res.json(resultset.recordset);
        }).catch(function (err) {
            console.log('res.json(err)', err);
            res.json(err);
        });

    };

    exports.getMarketProduct = function (connection, req, res) {
        var request = new sql.Request(connection);
        request.input('Id', sql.Int, req.params.id);
        var query = 'SELECT * FROM [Liberty].[v1].[MarketProduct] ' +
            ' WHERE Active = 1 ' +    // IsGas = 1 
            ' AND MarketStateId = @Id ' +
            ' ORDER BY ProductWebForm';
        request.query(query).then(function (resultset) {
            console.log(resultset.recordset);
            res.json(resultset.recordset);
        }).catch(function (err) {
            console.log('res.json(err)', err);
            res.json(err);
        });

    };

    exports.getMarketState = function (connection, req, res) {
        var request = new sql.Request(connection);
        var query = 'SELECT TOP (1000) [MarketStateId] ' +
            ',[State] ,[Active] FROM [Liberty].[v1].[MarketState] ' +
            ' WHERE Active = 1 ORDER BY STATE';
        request.query(query).then(function (resultset) {
            res.json(resultset.recordset);
        }).catch(function (err) {
            console.log('res.json(err)', err);
            res.json(err);
        });

    };

    exports.getUtilitiesByState = function (connection, req, res) {
        var request = new sql.Request(connection);
        request.input('state', sql.VarChar, req.params.state);
        var query = 'SELECT Utility.* ' +
        'FROM [Liberty].[v1].[MarketUtility] Utility ' +
        'JOIN [v1].[MarketState] [State] ' +
        'ON Utility.MarketStateId = [State].MarketStateId ' +
        'WHERE [State].State = @state ';
        'AND Utility.Active = 1 ';
        'AND [State].Active = 1 ';
        'ORDER BY UtilityName';

        console.log('query', query);
        request.query(query).then(function (resultset) {
            console.log(resultset.recordset);
            res.json(resultset.recordset);
        }).catch(function (err) {
            console.log('res.json(err)', err);
            res.json(err);
        });

    };

    exports.getProgramsByStateAndVendor = function (connection, req, res) {
        var request = new sql.Request(connection);
        request.input('state', sql.VarChar, req.params.state);
        request.input('vendor', sql.Int, req.params.vendor);
        var query = 'SELECT Program.ProgramId ' +
                        ',Program.ProgramName ' +
                        ',Program.State ' +
                    'FROM [v1].[ProgramVendor] ProgramVendor ' +
                    'JOIN [v1].[Program] Program ' +
                    'ON ProgramVendor.ProgramId = Program.ProgramId ' +
                    'WHERE ProgramVendor.VendorId = @vendor ' +
                    'AND Program.State = @state';

        request.query(query).then(function (resultset) {
            console.log(resultset.recordset);
            res.json(resultset.recordset);
        }).catch(function (err) {
            console.log('res.json(err)', err);
            res.json(err);
        });

    };

    exports.savetpv = function (req, res){

        if (req.body.ServiceAddress && req.body.ServiceAddress.TimeZone){
            var tz = req.body.ServiceAddress.TimeZone;

            req.body.EndTime = new Date(req.body.EndTime);
            req.body.StartTime = new Date(req.body.StartTime);

            var now = moment.utc();
            // get the zone offsets for this time, in minutes
            var tz_offset = moment.tz.zone(tz).offset(now)/60; // offset in hours

            //console.log('tzoffset ' , tz_offset)

            req.body.StartTime.setHours(req.body.StartTime.getHours() - tz_offset);
            req.body.EndTime.setHours(req.body.EndTime.getHours() - tz_offset);
        }

        var save = function(){
            db.libertyTPV.save(req.body,{upsert:true},  function(error, data){
                if (error)  console.log(error);

                res.json(data);
            })
        };

        if (req.body.Verified == 1){
            req.body.Concern = 'Verified';
        }

        if(req.body.ConfirmationNumber){
            req.body._id = db.ObjectId(req.body._id);
            save()  // updates an existing tpv
        }else {
            // get new confirmation number and Insert a new tpv
            db.runCommand(
                {
                    findAndModify: "ClientConfirmationNumber",
                    query: {_id:"Liberty"},
                    new: true,
                    upsert: true,
                    update: { $inc: { ConfirmationNumber: 1 } }
                }, function(err,data){
                    // console.log(data.value.ConfirmationNumber)
                    req.body.ConfirmationNumber = data.value.ConfirmationNumber ;
                    save()
                }
            )
        }
    };


    /* ==============  END LIBERTY SPECIFIC ============= */
    exports.getScriptQuestionsOLD = function (connection, req, res) {
        //console.log('conn',connection);

        const poolLiberty = new sql.ConnectionPool(newConfig, err => {
            var obj = "";
            var responseData = [];

            var request = new sql.Request(poolLiberty);
            request.stream = true;
            var query = 'SELECT * FROM ' +
                ' Scripts.vwScriptQuestions vwsq';

            request.query(query);
            //console.log(request.query);
            request.on('recordset', columms => {
                // emit once
                //console.log('columns');
            });

            request.on('row', row => {

                //console.log('row:', row);


                var requestOD = new sql.Request(poolLiberty);
                requestOD.input('QuestionId', sql.Int, row.QuestionId);
                var sqlquery = 'SELECT q.id AS QuestionId, d.* FROM ' +
                    ' Scripts.Question q ' +
                    ' JOIN Scripts.QuestionDirectiveAssoc qda ON q.Id = qda.QuestionId' +
                    ' JOIN Scripts.Directives d on qda.DirectiveId = d.Id ' +
                    ' WHERE q.Id = @QuestionId';
                requestOD.query(sqlquery, (err, result) => {
                    row.directives = result.recordset;
                    //console.log('row', row)


                    //console.log(row.directives[0].Tag);
                    obj = row.directives[0].Tag;
                    //obj.push(row.directives);
                    //obj = extend({}, row.directives);
                    responseData.push(row);

                    //console.log(result.recordset);
                    //console.log('directives',row.directives);
                });
                //console.log(row);
                //

            });

            request.on('error', err => {
                // May be emitted multiple times
                console.log('err', err);
            });



            // request.on('done', function (rowCount, more, rows) {
            //     console.log('rowCount',rowCount);
            //     console.log('more',more);
            //     console.log('rows',rows);
            // });

            request.on('done', result => {
                console.log('done x records', result);
                console.log('request', request.query.recordsets);

                console.log(responseData);
                console.log('obj', obj);
                //res.json(vm);
                res.json(responseData);

            })


        });

        sql.on('error', err => {
            console.log('err happened', err);
        })

    };

    //Below is for Liberty Portal

    exports.getVerifiedchart = function(connection, req,res){
        var date = new Date();
        date = req.params.range;

        console.log('date ' + date);

        req.params.vendorId = req.params.vendorId == 0? null : req.params.vendorId;
        req.params.officeId = req.params.officeId == 0? null : req.params.officeId;

        var returnSummaryData = [];
        var returnDetailData = [];
        var returnAllData = [];

        if ((req.params.vendorId === null) && (req.params.officeId === null)){
            db.libertyTPV.aggregate(
                [
                    { $match: {"Verified" :{ $exists:true} , "StartTime":{ $gte:date} }},
                    { $group:
                        {
                            _id: { Verified : "$Verified"},
                            Calls: { $sum: 1 }
                        }
                    }

                ]
            ).toArray(function(err,data) {

                if (err !== null){
                    console.log('error', err);
                }

                data.forEach(function (dataObj) {
                    switch (dataObj._id.Verified) {
                        case 0:
                            dataObj._id.Verified = 'Not Verified';
                            break;
                        case 1:
                            dataObj._id.Verified = 'Verified';
                            break;
                        default:
                            dataObj._id.Verified = 'Not Verified';
                    }

                    var summaryObj = {
                        Disposition: '',
                        Calls: ''
                    }

                    summaryObj.Disposition = dataObj._id.Verified;
                    summaryObj.Calls = dataObj.Calls;

                    returnSummaryData.push(summaryObj);
                    return returnSummaryData;
                });

                returnAllData.push(returnSummaryData);
            });
            db.libertyTPV.aggregate(
                [
                    { $match: {"Verified" :0 , "StartTime":{ $gte:date} }},
                    { $group:
                        {
                            _id: { Concern: "$Concern" },
                            Calls: { $sum: 1 }
                        }
                    }

                ]
            ).toArray(function(err,data) {
                console.log('data ', data);

                if (err !== null){
                    console.log('error', err);
                }

                var counter = 0;
                data.forEach(function (dataObj) {

                    if ((dataObj._id.Concern === undefined) || (dataObj._id.Concern === 'undefined')|| (dataObj._id.Concern === null)) {
                        dataObj._id.Concern = 'Test Call ' + counter;
                        counter++;
                    }

                    var detailsObj = {
                        Disposition: '',
                        Calls: ''
                    }

                    detailsObj.Disposition = dataObj._id.Concern;
                    detailsObj.Calls = dataObj.Calls
                    returnDetailData.push(detailsObj);
                });
                console.log('returnDetailData --- ' + returnDetailData);
                returnAllData.push(returnDetailData);
                res.json(returnAllData);
            });
        }
        else{
            db.libertyTPV.aggregate(
                [
                    { $match: {"VendorId" :req.params.vendorId ,"OfficeId" :req.params.officeId ,"Verified" :{ $exists:true} , "StartTime":{ $gte:date} }},
                    { $group:
                        {
                            _id: { Verified : "$Verified"},
                            Calls: { $sum: 1 }
                        }
                    }

                ]
            ).toArray(function(err,data) {
                console.log('error', err);
                //console.log('data', data);
                data.forEach(function (dataObj) {
                    switch (dataObj._id.Verified) {
                        case 0:
                            dataObj._id.Verified = 'Not Verified';
                            break;
                        case 1:
                            dataObj._id.Verified = 'Verified';
                            break;
                        default:
                            dataObj._id.Verified = 'Not Verified';
                    }

                    var summaryObj = {
                        Disposition: '',
                        Calls: ''
                    }

                    summaryObj.Disposition = dataObj._id.Verified;
                    summaryObj.Calls = dataObj.Calls;

                    returnSummaryData.push(summaryObj);
                    return returnSummaryData;
                });

                console.log('returnSummaryData', returnSummaryData);

                returnAllData.push(returnSummaryData);
            });
            db.libertyTPV.aggregate(
                [
                    { $match: {"VendorId" :req.params.vendorId ,"OfficeId" :req.params.officeId ,"Verified" :0 , "StartTime":{ $gte:date} }},
                    { $group:
                        {
                            _id: { Concern: "$Concern" },
                            Calls: { $sum: 1 }
                        }
                    }

                ]
            ).toArray(function(err,data) {
                console.log('error', err);
                var counter = 0;
                data.forEach(function (dataObj) {

                    if ((dataObj._id.Concern === undefined) || (dataObj._id.Concern === 'undefined')|| (dataObj._id.Concern === null)) {
                        dataObj._id.Concern = 'Test Call ' + counter;
                        counter++;
                    }

                    var detailsObj = {
                        Disposition: '',
                        Calls: ''
                    }

                    detailsObj.Disposition = dataObj._id.Concern;
                    detailsObj.Calls = dataObj.Calls
                    returnDetailData.push(detailsObj);
                });

                returnAllData.push(returnDetailData);
                res.json(returnAllData);
            });
        }
    }

    exports.getDispositions = function(connection, req,res){
        var data = db.libertyTPV.distinct('Concern').toArray(function(err,data) {
            res.json(data);
        });
    }

    exports.getCallSearchReport = function(req,res){

        var startDate = new Date(req.body.startDate);
        var endDate = new Date(req.body.endDate);

        startDate = moment(startDate).format("YYYY-MM-DD" );
        endDate = moment(endDate).format("YYYY-MM-DD" );
        console.log('startDate', startDate);
        db.libertyTPV.find({
            "StartTime":{
                $gte:startDate,
                $lte:endDate
            }}, function(error, data){
                if (error) {
                    console.log('getCallSearchReport error', error);
                }
                console.log('getCallSearchReport data', data);
                var returnData = [];
                data.forEach(function (d) {
                    var returnObject = {
                        MainId: d.ConfirmationNumber,
                        CallDateTime: d.StartTime,
                        WavName: d.WavName,
                        ConcernCode: d.ConcernCode,
                        AuthorizationFirstName: d.FirstName,
                        AuthorizationLastName: d.LastName,
                        Btn: d.BTN,
                        TpvAgentId: d.AgentId,
                        Verified: d.Verified,
                        Concern: d.Concern,
                        AgentName: d.AgentName,
                        OrderDetails:[

                        ]
                    }

                    var an = {};

                    if ((d.ElectricAccountNumber !== undefined) && (d.GasAccountNumber !== undefined)){
                        an = {AccountNumber: d.ElectricAccountNumber}
                        returnObject.OrderDetails.push(an);
                        an = {AccountNumber: d.GasAccountNumber};
                        returnObject.OrderDetails.push(an);
                    }
                    else if (d.ElectricAccountNumber !== undefined){
                        an = {AccountNumber: d.ElectricAccountNumber}
                        returnObject.OrderDetails.push(an);
                    }
                    else if (d.GasAccountNumber !== undefined){
                        an = {AccountNumber: d.GasAccountNumber}
                        returnObject.OrderDetails.push(an);
                    }

                    returnData.push(returnObject);
                })
                console.log('returnData', returnData);
                res.json(returnData);
            }
        );
    };

}());