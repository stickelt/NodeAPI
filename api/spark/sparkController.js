(function () {
    'use strict';
    var sql = require('mssql');
    var common = require('../common/controller');
    var config = require('../../config.js');
    var mongojs = require('mongojs');
    var collections = ['sparkTPV', 'ClientConfirmationNumber'];
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
                common.employeeVerification(connection, 'Spark', qObj, req, res);
                break;
            case 5:
                common.officeByName(connection, qObj.OfficeName, req, res);
                break;
            case 161:
                //console.log(qObj)
                common.getStateByZip(connection, qObj.ServiceAddress, req, res);
                break;
            case  4:
                common.btnCheck(connection, qObj.BTN, req, res, config.btn);
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

    exports.savetpv = function (req, res) {

        if (req.body.ServiceAddress){
            var tz = req.body.ServiceAddress.TimeZone;

            req.body.EndTime = new Date(req.body.EndTime);
            req.body.StartTime = new Date(req.body.StartTime);

            var now = moment.utc();
            // get the zone offsets for this time, in minutes
            var tz_offset = moment.tz.zone(tz).offset(now) / 60; // offset in hours

            req.body.StartTime.setHours(req.body.StartTime.getHours() - tz_offset);
            req.body.EndTime.setHours(req.body.EndTime.getHours() - tz_offset);
        }

        var save = function () {
            db.sparkTPV.save(req.body, {upsert: true}, function (error, data) {
                if (error) console.log(error);

                res.json(data);
            })
        };

        if (req.body.ConfirmationNumber) {
            req.body._id = db.ObjectId(req.body._id);
            save()  // updates an existing tpv
        } else {
            // get new confirmation number and Insert a new tpv
            db.runCommand(
                {
                    findAndModify: "ClientConfirmationNumber",
                    query: {_id: "Spark"},
                    new: true,
                    upsert: true,
                    update: {$inc: {ConfirmationNumber: 1}}
                }, function (err, data) {
                    // console.log(data.value.ConfirmationNumber)
                    req.body.ConfirmationNumber = data.value.ConfirmationNumber;
                    save()
                }
            )
        }
    };

}());