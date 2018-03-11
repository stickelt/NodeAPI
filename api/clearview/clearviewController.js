(function () {
    'use strict';
    var sql = require('mssql');
    var common = require('../common/controller');
    var config = require('../../config.js');
    var mongojs = require('mongojs');
    var collections = ['clearviewTPV', 'ClientConfirmationNumber'];
    var db = mongojs(config.mongo, collections);
    var moment = require('moment');
    var isodate = require('isodate');
    var moment = require('moment-timezone')

    exports.validation = function (connection, req, res, config) {
        var qObj = req.body;

        qObj.directiveAnswers.forEach(function (r) {
            if (r.objName) {
                qObj[r.objName] = r.response;
                console.log(qObj[r.objName])
            }
        });

        switch (qObj.questionId) {
            case 2:
                common.officeByName(connection, qObj.OfficeName, req, res);
                break;
            case 161:
                //console.log(qObj)
                common.getStateByZip(connection, qObj.ServiceAddress, req, res);
                break;
            case  4:
                common.btnCheck(connection, qObj.BTN, req, res, config.btn);
                break;
            case 32:
                getAgentId(connection, qObj, req, res);
                break;
            case 33:
                getTPV(connection, qObj.MainId, req, res);
                break;
            case 35:
                getProgramCode(connection, qObj, 'Electric', req, res);
                break;
            case 36:
                getProgramCode(connection, qObj, 'Gas', req, res);
                break;
            default:
                res.json({"Default": {html: "No validation for this question Id " + qObj.questionId}})
        }
    };

    exports.getProgramsByStateAndVendor = function (connection, req, res) {
        var request = new sql.Request(connection);
        request.input('userVendorId', sql.Int, req.params.vendorId);
        request.input('userOfficeId', sql.Int, req.params.officeId);
        request.input('state', sql.VarChar, req.params.state);
        request.input('zip', sql.VarChar, req.params.zip);
        request.input('creditcheck', sql.Int, req.params.creditcheck);
        request.input('premisetype', sql.Int, req.params.premisetype);

        request.execute('[dbo].[GetUtilityPrograms]').then(function (resultset) {
            console.log(resultset.recordset);
            res.json(resultset.recordset);
        }).catch(function (err) {
            console.log('res.json(err)', err);
            res.json(err);
        });

    };

    exports.savetpv = function (connection, req, res) {
        //first insert into SQL

        if (req.body.ServiceAddress && req.body.ServiceAddress.TimeZone) {
            var tz = req.body.ServiceAddress.TimeZone;

            req.body.EndTime = new Date(req.body.EndTime);
            req.body.StartTime = new Date(req.body.StartTime);

            var now = moment.utc();
            // get the zone offsets for this time, in minutes
            var tz_offset = moment.tz.zone(tz).offset(now) / 60; // offset in hours

            //console.log('tzoffset ' , tz_offset)

            req.body.StartTime.setHours(req.body.StartTime.getHours() - tz_offset);
            req.body.EndTime.setHours(req.body.EndTime.getHours() - tz_offset);
        }

        if (!req.body.MainId) {
            var request = new sql.Request(connection);
            request.execute('[Scripts].[insertMainRecordFromTPV]').then(function (resultset) {
                db.clearviewTPV.save(req.body, {upsert: true}, function (error, data) {
                    if (error) console.log(error);
                    req.body.MainId = resultset.returnValue;
                    req.body.ConfirmationNumber = resultset.returnValue;
                    req.body._id = data._id;

                    var request1 = new sql.Request(connection);
                    request1.input('mainid', sql.Int, req.body.MainId)
                    var query = 'select  * from v1.main ' +
                        ' where mainid = @mainid';
                    request1.query(query).then(function (resultset) {
                        console.log('resultset ', resultset)
                        resultset.recordset[0].ConfirmationNumber = req.body.ConfirmationNumber;
                        resultset.recordset[0]._id = req.body._id;
                        res.json(resultset.recordset[0])
                    }).catch(function (err) {
                        res.json(err)
                    })
                })
            }).catch(function (err) {
                console.log('Error in insertMainRecordFromTPV sp: ', err);
            });
        } else {
            db.clearviewTPV.save(req.body, {upsert: true}, function (error, data) {
                if (error) console.log(error);
                req.body._id = data._id;

                res.json(data);
            })
        }
    };

    function getTPV(connection, mainId, req, res) {
        var request = new sql.Request(connection);
        request.input('MainId', sql.Int, mainId)
        var query = "SELECT * FROM [v1].[Main] WHERE MainId = @MainId AND Verified = '9'";
        var queryOD = "SELECT * FROM [v1].[OrderDetail] WHERE MainId = @MainId";

        request.query(query).then(function (resultset) {
            if (resultset.recordset.length > 0) {
                console.log('resultset ', resultset)
                request.query(queryOD).then(function (resultsetOD) {
                    if (resultsetOD.recordset.length > 0) {
                        //console.log('resultsetOD.recordset ',resultsetOD.recordset )
                        resultset.recordset[0].OrderDetail = resultsetOD.recordset;
                    }
                    res.json(resultset.recordset[0]);
                }).catch(function (err) {
                    //console.log('OD error',err )
                    res.json(err)
                });
            } else {
                var Error = {
                    ErrorMessage: 'Could not find Confirmation Number provided. Please correct it and try again.'
                }
                res.json(Error);
            }
        }).catch(function (err) {
            //console.log('Main error',err )
            res.json(err)
        });
    }

    function getProgramCode(connection, obj, utilityType, req, res) {
        var request = new sql.Request(connection);
        var utilityTypeId = utilityType === "Electric" ? 2 : 1;
        request.input('ProgramCode', sql.VarChar, obj.ElectricCode)
        request.input('UtilityTypeId', sql.Int, utilityTypeId)
        var query = "SELECT * FROM [v1].[Program] WHERE ProgramCode = @ProgramCode AND UtilityTypeId = @UtilityTypeId";

        request.query(query).then(function (resultset) {
            res.json(resultset.recordset[0]);
        }).catch(function (err) {
            res.json(err)
        });
    }

    function getAgentId(connection, obj, req, res) {
        var request = new sql.Request(connection);
        request.input('AgentId', sql.VarChar, obj.AgentId);
        var query = "SELECT AgentId FROM [v1].[User] WHERE AgentId = @AgentId AND IsActive = 1";

        request.query(query).then(function (resultset) {
            if (resultset.recordset.length == 0) {
                var Error = {
                    ErrorMessage: 'Could not validate Clearview ID. Please correct it and try again.'
                }
                res.json(Error);
            } else {
                console.log('resultset.recordset ', resultset.recordset)
                res.json(resultset.recordset);
            }
        }).catch(function (err) {
            res.json(err)
        });
    }
}());