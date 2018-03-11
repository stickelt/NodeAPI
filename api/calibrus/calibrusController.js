'use strict';
var sql = require('mssql');
var moment = require('moment')
var mongojs = require('mongojs')
var collections = ['TPV', 'scripts', 'Cox', 'DailyStats', 'WeeklyStats', 'MonthlyStats', 'User', 'ClientTpvSqlMapping']
var config = require('../../config')
var db = mongojs(config.mongo, collections)
var nodemailer = require('nodemailer')

var _ = require('lodash');

exports.getCalibrusAppLog = function (connection, req, res) {
    var request = new sql.Request(connection);
    var query = 'SELECT * FROM ' +
        ' dbo.tblApplication';

    request.query(query).then(function (resultset) {
        console.log(resultset);
        res.json(resultset.recordset);
    }).catch(function (err) {
        console.log('res.json(err)', err);
        res.json(err);
    });
}

exports.escape = function (req, res) {
    var exp = /^(\(?[0-9]{3}\)?)((\s|\-){1})?[0-9]{3}((\s|\-){1})?[0-9]{4}$/
    var phone = "555-555-5555"
    var result = {}
    result.test = phone.match(exp)
    res.json(result)

}

exports.createUser = function (req, res) {
    req.body.company.modified = new Date()
    req.body.company.CreatedBy = req.body.user.name

    db.User.find(req.body.user, (err, data) => {
        if (data)
            db.User.save(req.body.company, {upsert: true}, function (err, data) {
                if (err) {
                    res.status(401).json(err)
                    return res.end()
                }

                nodemailer.createTestAccount(err => {
                    if (err) console.log(err)
                    let transporter = nodemailer.createTransport({
                        host: 'email-smtp.us-east-1.amazonaws.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: 'AKIAJUC42PTSXVFX4EKA',
                            pass: 'AoEStADnRAd86pDJh7O18BJI+Vut2RBkkrirZ7wzBwA3'
                        }
                    })

                    var html = '<p> Your credentials </p> ' +
                        '<table><tr><th>username</th><th>Password</th></tr>' +
                        ' <tr><td>' + data.name + '</td><td>' + data.pwd + '</td></tr> </table>' +
                        '<p>to get your token call the following api method POST </p><p></p> <code>http://utilities.calibrus.com:3500/api/auth</code>' +
                        '<code>{name:' + data.name + ', pwd:' + data.pwd + ' }</code></p>';

                    let mailOptions = {
                        from: 'tech@calibrus.com',
                        to: data.email,
                        subject: "Calibrus Api Token credentials",
                        html: html
                    }

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) console.log(error)
                        console.log('mail sent')
                    })
                })

                res.json(data)

            })
    })


}


exports.loadAggregates = function (req, res) {

    var pbx = req.app.connectionPbx;

    var request = new sql.Request(pbx)
    request.input("Startdate", sql.DateTime, new Date(req.params.startdate))
    request.input("Enddate", sql.DateTime, new Date(req.params.enddate))
    console.log('running proc', new Date(req.params.startdate), new Date(req.params.enddate))

    request.execute('spCallaggregate').then(function (result) {
        res.send(result.recordsets)

        console.log('result set', result.recordsets.length)
        // daily
        result.recordsets[0].forEach(function (d) {
            db.DailyStats.update({"client": d.client, "date": d.date, "year": d.year}, {
                "client": d.client,
                "date": d.date,
                "callSeconds": d.totalseconds,
                "totalCalls": d.calls,
                "year": d.year,
                "isodate": new Date(d.date)
            }, {upsert: true})
        })

        // weekly
        result.recordsets[1].forEach(function (w) {
            db.WeeklyStats.update({"client": w.client, "date": w.date, "year": w.year}, {
                "client": w.client, "date": w.date, "callSeconds": w.totalseconds, "totalCalls": w.calls, "year": w.year
            }, {upsert: true})
        })
        // monthly
        result.recordsets[2].forEach(function (m) {
            db.MonthlyStats.update({"client": m.client, "date": m.date, "year": m.year}, {
                "client": m.client, "date": m.date, "callSeconds": m.totalseconds, "totalCalls": m.calls, "year": m.year
            }, {upsert: true})
        })

    })

}

exports.getClients = function (req, res) {
    db = req.app.db;

    db.TPV.distinct("client", {}, function (err, data) {
        if (err) {
            res.json(err);
            return;
        }
        data.push('All')
        res.json(data);
    })
}

exports.getDailys = function (req, res) {
    db = req.app.db;
    var client = req.params.client, obj = {};

    if (client == 'All') {
        db.DailyStats.aggregate([
            {$match: {"client": {$ne: null}}},
            {
                $group: {
                    "_id": {"year": "$year", "date": "$date"},
                    "callSeconds": {"$sum": "$callSeconds"},
                    "totalCalls": {"$sum": "$totalCalls"}
                }
            },
            {$sort: {"_id.year": 1, "_id.date": 1}}

        ], function (err, data) {
            res.json(data)
        })
    } else {
        obj = {"client": client}
        db.DailyStats.find(obj).sort({year: 1, date: 1}, function (err, data) {
            if (err) {
                res.json(err);
                return;
            }
            res.json(data);
        })
    }
}

exports.getWeeklys = function (req, res) {
    db = req.app.db;
    var client = req.params.client, obj = {};

    if (client == 'All') {
        db.WeeklyStats.aggregate([
            {$match: {"client": {$ne: null}}},
            {
                $group: {
                    "_id": {"year": "$year", "date": "$date"},
                    "callSeconds": {"$sum": "$callSeconds"},
                    "totalCalls": {"$sum": "$totalCalls"}
                }
            },
            {$sort: {"_id.year": 1, "_id.date": 1}}

        ], function (err, data) {
            res.json(data)
        })
    } else {
        obj = {"client": client}
        db.WeeklyStats.find(obj).sort({year: 1, date: 1}, function (err, data) {
            if (err) {
                res.json(err);
                return;
            }
            res.json(data);
        })
    }
}

exports.getMonthlys = function (req, res) {
    db = req.app.db;
    var client = req.params.client, obj = {};

    if (client == 'All') {
        db.MonthlyStats.aggregate([
            {$match: {"client": {$ne: null}}},
            {
                $group: {
                    "_id": {"year": "$year", "date": "$date"},
                    "callSeconds": {"$sum": "$callSeconds"},
                    "totalCalls": {"$sum": "$totalCalls"}
                }
            },
            {$sort: {"_id.year": 1, "_id.date": 1}}

        ], function (err, data) {
            res.json(data)
        })
    } else {
        obj = {"client": client}
        db.MonthlyStats.find(obj).sort({year: 1, date: 1}, function (err, data) {
            if (err) {
                res.json(err);
                return;
            }
            res.json(data);
        })
    }
}

exports.getDispositions = function (connection, req, res) {
    var request = new sql.Request(connection);
    var query = 'SELECT * FROM ' +
        ' dbo.tblDispositions where Active = 1 order by DisplayOrder  ';

    request.query(query).then(function (resultset) {
        console.log(resultset);
        res.json(resultset.recordset);
    }).catch(function (err) {
        console.log('res.json(err)', err);
        res.json(err);
    });
}

exports.getBillingData = function (req, res, connection) {
    var request = new sql.Request(connection)
    // console.log(req.params)
    request.input("StartDate", sql.DateTime, new Date(req.params.startdate))
    request.input("EndDate", sql.DateTime, new Date(req.params.enddate))
    //console.log('running proc', new Date(req.params.startdate), new Date(req.params.enddate))

    var objReturnSqlResult = [];
    var objReturnMongoBilling = [];
    var objReturnMongoTotals = [];
    var objReturnMongoDetails = [];
    var objCombinedReturn = [];
    var holdClient = '';
    request.execute('[dbo].[Billing]').then(function (result) {

        //Adding sql result to the return object
        objReturnSqlResult.push(result);
        objCombinedReturn.push(objReturnSqlResult);

        db.BillingRate.find({"client": {$nin: ["Spark", "Clearview", "Champion", "Constellation", "Liberty", "INACTIVE", "Duplicate", "NULL"]}}, function(err, billingData){
            objReturnMongoBilling.push(billingData);
            objCombinedReturn.push(objReturnMongoBilling);

            db.DailyStats.aggregate(
                [
                    {
                        $match: {
                            'isodate': {
                                $gte: new Date(req.params.startdate),
                                $lte: new Date(req.params.enddate)
                            },
                            "client": {$nin: ["Spark", "Clearview", "Champion", "Constellation", "Liberty", "INACTIVE", "Duplicate", "NULL", null]}
                        }
                    },
                    {
                        $group:
                            {
                                _id: {client: "$client"},
                                callSeconds: {$sum: "$callSeconds"},
                                totalCalls: {$sum: "$totalCalls"}
                            }
                    }
                ]
            ).toArray(function(err, dataTotals){
                objReturnMongoTotals.push(dataTotals);
                objCombinedReturn.push(objReturnMongoTotals);
                db.DailyStats.find(
                    {
                        'isodate': {$gte: new Date(req.params.startdate), $lte: new Date(req.params.enddate)},
                        "client": {$nin: ["Spark", "Clearview", "Champion", "Constellation", "Liberty", "INACTIVE", "Duplicate", "NULL", null]}
                    }).sort({"client": 1}, function (err, dailyData) {
                    objReturnMongoDetails.push(dailyData);
                    objCombinedReturn.push(objReturnMongoDetails);
                    res.json(objCombinedReturn);
                })
            })
        }).catch(function (err) {
            console.log('res.json(err)', err);
            res.json(err);
        });
    })
}

exports.createMappingRecords = function (req, res){
    db.ClientTpvSqlMapping.save(req.body,{upsert:true},  function(error, data){
        var returnObj = [];
        if (error){
            console.log(error);
            var errorObj = {
                Error: 'test error'
            }
            returnObj.push(errorObj)
        }else{
            returnObj = data;
        }

        console.log('data ', data);
        res.json(returnObj);
    })
}

exports.getMappingRecords = function (req, res, client){
    var obj = {"Client": client};
    db.ClientTpvSqlMapping.find(obj, function (err, data) {
        if (err) {
            res.json(err);
            return;
        }
        res.json(data);
    });
}

exports.getClientToken = function (req, res){
    var obj = {"client": req.params.client};
    console.log('req.params ', req.params)
    db.clientAuthToken.find(obj, function (err, data) {
        if (err) {
            res.json(err);
            return;
        }
        console.log('data ', data)
        res.json(data);
    });
}

exports.authenticateUser = function (connection, req, res) {
    var request = new sql.Request(connection);
    if (!req.body.id){
        request.input("DB", sql.VarChar, req.body.client);
        request.input("AgentId", sql.VarChar, req.body.agentid);
        request.input("Password", sql.VarChar, req.body.password);

        request.execute('[dbo].[AuthenticateUser]').then(function (result){
            if (result.recordsets[0].length === 0){
                setupError(res, 'Invalid user');
            }else {
                res.json(result.recordsets[0][0]);
            }
        }).catch(function (err) {
            setupError(res, err.message);
        });
    }else{
        request.input("DB", sql.VarChar, req.body.client);
        request.input("UserId", sql.Int, req.body.id);

        request.execute('[dbo].[AuthenticateUserById]').then(function (result){
            if (result.recordsets[0].length === 0){
                setupError(res, 'Invalid user');
            }else {
                res.json(result.recordsets[0][0]);
            }
        }).catch(function (err) {
            setupError(res, err.message);
        });
    }
}

var setupError = function(res, err){
    var result = {
        recordset:
            {
                ErrorMessage: err
            }

    }
    res.json(result.recordset);
}