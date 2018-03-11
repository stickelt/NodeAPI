/** functions related to portal functions **/
'use strict'

var config = require('../../config.js'),
    sql = require('mssql'),
    mongojs = require('mongojs'),
    collections = ['libertyTPV', 'clearviewTPV', 'sparkTPV'],
    db = mongojs(config.mongo,collections),
    moment = require('moment-timezone')

exports.getDashboard = function(connection,req,res){

    // just a stub

    var dashboard = {}
    dashboard.graphs = [
        {ytd:[[{"Disposition":"Not Verified","Calls":1928},{"Disposition":"Verified","Calls":3300}], [
                {
                    "Disposition": "Agent Interrupted TPV Process",
                    "Calls": 3
                },
                {
                    "Disposition": "Connectivity (Bad Transfer/Connection)",
                    "Calls": 2
                },
                {
                    "Disposition": "Cust Hungup / Disconnect During Verification",
                    "Calls": 11
                },
                {
                    "Disposition": "Customer Changed Mind",
                    "Calls": 6
                },
                {
                    "Disposition": "Customer Did Not Agree To Acct Num/Meter Num",
                    "Calls": 2
                },
                {
                    "Disposition": "Customer Did Not Understand No Savings",
                    "Calls": 1
                },
                {
                    "Disposition": "Customer Did Not Understand Rate",
                    "Calls": 3
                },
                {
                    "Disposition": "Customer Did Not Understand Rescission",
                    "Calls": 1
                },
                {
                    "Disposition": "Customer Did Not Understand Supplier Relation",
                    "Calls": 2
                },
                {
                    "Disposition": "Customer Had Questions/Did Not Agree",
                    "Calls": 13
                },
                {
                    "Disposition": "Customer on Government Assistance",
                    "Calls": 3
                },
                {
                    "Disposition": "Did Not Agree To Service Address",
                    "Calls": 3
                },
                {
                    "Disposition": "Was Not Authorized",
                    "Calls": 1
                }
            ]]},
        {monthly:[[{"Disposition":"Not Verified","Calls":1928},{"Disposition":"Verified","Calls":3300}], [
                {
                    "Disposition": "Agent Interrupted TPV Process",
                    "Calls": 3
                },
                {
                    "Disposition": "Connectivity (Bad Transfer/Connection)",
                    "Calls": 2
                },
                {
                    "Disposition": "Cust Hungup / Disconnect During Verification",
                    "Calls": 11
                },
                {
                    "Disposition": "Customer Changed Mind",
                    "Calls": 6
                },
                {
                    "Disposition": "Customer Did Not Agree To Acct Num/Meter Num",
                    "Calls": 2
                },
                {
                    "Disposition": "Customer Did Not Understand No Savings",
                    "Calls": 1
                },
                {
                    "Disposition": "Customer Did Not Understand Rate",
                    "Calls": 3
                },
                {
                    "Disposition": "Customer Did Not Understand Rescission",
                    "Calls": 1
                },
                {
                    "Disposition": "Customer Did Not Understand Supplier Relation",
                    "Calls": 2
                },
                {
                    "Disposition": "Customer Had Questions/Did Not Agree",
                    "Calls": 13
                },
                {
                    "Disposition": "Customer on Government Assistance",
                    "Calls": 3
                },
                {
                    "Disposition": "Did Not Agree To Service Address",
                    "Calls": 3
                },
                {
                    "Disposition": "Was Not Authorized",
                    "Calls": 1
                }
            ]]},
        {weekly:[[{"Disposition":"Not Verified","Calls":1928},{"Disposition":"Verified","Calls":3300}], [
                {
                    "Disposition": "Agent Interrupted TPV Process",
                    "Calls": 3
                },
                {
                    "Disposition": "Connectivity (Bad Transfer/Connection)",
                    "Calls": 2
                },
                {
                    "Disposition": "Cust Hungup / Disconnect During Verification",
                    "Calls": 11
                },
                {
                    "Disposition": "Customer Changed Mind",
                    "Calls": 6
                },
                {
                    "Disposition": "Customer Did Not Agree To Acct Num/Meter Num",
                    "Calls": 2
                },
                {
                    "Disposition": "Customer Did Not Understand No Savings",
                    "Calls": 1
                },
                {
                    "Disposition": "Customer Did Not Understand Rate",
                    "Calls": 3
                },
                {
                    "Disposition": "Customer Did Not Understand Rescission",
                    "Calls": 1
                },
                {
                    "Disposition": "Customer Did Not Understand Supplier Relation",
                    "Calls": 2
                },
                {
                    "Disposition": "Customer Had Questions/Did Not Agree",
                    "Calls": 13
                },
                {
                    "Disposition": "Customer on Government Assistance",
                    "Calls": 3
                },
                {
                    "Disposition": "Did Not Agree To Service Address",
                    "Calls": 3
                },
                {
                    "Disposition": "Was Not Authorized",
                    "Calls": 1
                }
            ]]},
        {today:[[{"Disposition":"Not Verified","Calls":1928},{"Disposition":"Verified","Calls":3300}], [
                {
                    "Disposition": "Agent Interrupted TPV Process",
                    "Calls": 3
                },
                {
                    "Disposition": "Connectivity (Bad Transfer/Connection)",
                    "Calls": 2
                },
                {
                    "Disposition": "Cust Hungup / Disconnect During Verification",
                    "Calls": 11
                },
                {
                    "Disposition": "Customer Changed Mind",
                    "Calls": 6
                },
                {
                    "Disposition": "Customer Did Not Agree To Acct Num/Meter Num",
                    "Calls": 2
                },
                {
                    "Disposition": "Customer Did Not Understand No Savings",
                    "Calls": 1
                },
                {
                    "Disposition": "Customer Did Not Understand Rate",
                    "Calls": 3
                },
                {
                    "Disposition": "Customer Did Not Understand Rescission",
                    "Calls": 1
                },
                {
                    "Disposition": "Customer Did Not Understand Supplier Relation",
                    "Calls": 2
                },
                {
                    "Disposition": "Customer Had Questions/Did Not Agree",
                    "Calls": 13
                },
                {
                    "Disposition": "Customer on Government Assistance",
                    "Calls": 3
                },
                {
                    "Disposition": "Did Not Agree To Service Address",
                    "Calls": 3
                },
                {
                    "Disposition": "Was Not Authorized",
                    "Calls": 1
                }
            ]]}
    ]
    dashboard.detail = [
        {vendorsales:[{}]}
    ]

    res.json(dashboard)
}


