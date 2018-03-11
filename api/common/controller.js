/**
 * Created by sward on 5/3/2017.
 */
'use strict';
var config = require('../../config.js');
var sql = require('mssql');
var mongojs = require('mongojs');
var collections = ['tpvLog','scripts'];
var db = mongojs(config.mongo, collections);
var sqlConfig = config.database.liberty;
var cities = require('cities');
var request = require('request');
var zipToTimeZone = require('zipcode-to-timezone');
var moment = require('moment-timezone');

// This method mutates the .Data property from a string to a js object literal using JSON.parse.
var parseDirectiveAssociations = function(directiveAssociations) {
    if (Array.isArray(directiveAssociations)) {
        directiveAssociations.forEach(function (directiveAssociation) {
            if (directiveAssociation && typeof directiveAssociation.Data === 'string') {
                try {
                    directiveAssociation.Data = JSON.parse(directiveAssociation.Data);
                } catch (err) {
                    console.log(err)
                }
            }
        });
    }
}

var zipcodeError = function (message, res){
    var Error= {
        ErrorMessage: message
    }
    res.json(Error);
}

var zipcodeSuccess = function (data, res){
    var tz = zipToTimeZone.lookup(data.zipcode);
    var result = {
        recordset: [
            {
                html: "State Code: " + data.state,
                City: data.city,
                State: data.state_abbr,
                Zipcode: data.zipcode,
                TimeZone: tz
            }
        ]
    }
    res.json({ServiceAddress:result.recordset[0]});
}

exports.getmain = function (connection, req, res) {

    var request = new sql.Request(connection);
    request.input('mainid', sql.Int, req.params.mainid)
    var query = 'select  * from v1.main ' +
        ' where mainid = @mainid';
    request.query(query).then(function (resultset) {
        res.json(resultset.recordset)
    }).catch(function (err) {
        res.json(err)
    })

}

exports.getVendor = function (connection, req, res) {
    var request = new sql.Request(connection);
    request.input('vendorid', sql.Int, req.params.id);
    var query = 'select * from v1.Vendor ' +
        ' where VendorId = @vendorid';
    request.query(query).then(function (resultset) {
        res.json(resultset.recordset[0])
    }).catch(function (err) {
        res.json(err)
    })
};

exports.getAllVendors = function (connection, req, res) {

    var request = new sql.Request(connection);
    /*request.input('mainid', sql.Int, req.params.mainid)*/
    var query = "select * from [dbo].[vVendorPage]";
    request.query(query).then(function (resultset) {
        res.json(resultset.recordset)
    }).catch(function (err) {
        res.json(err)
    })

}

exports.getAllOffices = function (connection, req, res) {

    var request = new sql.Request(connection);
    /*request.input('mainid', sql.Int, req.params.mainid)*/
    var query = "select * from [dbo].[vOfficePage]";
    request.query(query).then(function (resultset) {
        res.json(resultset.recordset)
    }).catch(function (err) {
        res.json(err)
    })

}

exports.getDNIS = function(req,res){
    db.scripts.findOne({"Dnis": req.params.dnis},function(err,data){
        res.json(data);
    })
}

exports.getAllSalesChannels = function(connection, req,res){
    var request = new sql.Request(connection);
    var query = 'SELECT id, Name FROM [Scripts].[vwSalesChannel]';
    request.query(query).then(function (resultset) {
      //  console.log(resultset)
        res.json(resultset.recordset)
    }).catch(function (err) {
        console.log(err)
        res.json(err)
    })
}

exports.officeByName = function(connection,officeName, req,res){
var request = new sql.Request(connection)
    request.input('OfficeName',sql.VarChar,officeName)
    request.execute('Scripts.getOfficeByName').then(function(result){
       var html = "Office Name: " + result.recordset[0].OfficeName;
       result.recordset[0].html = html;
       res.json({Office:result.recordset[0]});
    }).catch(function(err){
        var Error= {
            SystemErrorMessage: err
        }
        res.json(Error);
    })

}

exports.employeeVerification = function(connection, client, obj, req,res){
    var request = new sql.Request(connection)
    request.input('AgentId',sql.VarChar, obj.AgentId)
    request.input('VendorNumber',sql.VarChar, obj.VendorId)

    var query = "SELECT u.[UserId], u.[AgentId], v.[VendorId], v.[VendorName], u.[FirstName], u.[LastName], u.IsActive, ulmax.LatestDate " +
        " FROM [v1].[User] u INNER JOIN [v1].[Vendor] v on u.VendorId = v.VendorId  " +
        " INNER JOIN (SELECT UserId, MAX(CreatedDateTime) LatestDate FROM v1.UserLog GROUP BY UserId) AS ulmax ON u.UserId = ulmax.UserId " +
        " WHERE u.AgentId = @Agentid AND v.VendorNumber = @VendorNumber";

    request.query(query).then(function (resultset) {

        var result = {
            recordset: [
                {
                    html: ''
                }
            ]
        };

        var strValid = '';

        if (resultset.recordset.length > 0){
            if (resultset.recordset[0].IsActive === true){
                strValid = `Valid - The Agent ID you provided is assigned to ${resultset.recordset[0].FirstName} ${resultset.recordset[0].LastName}. This independent sales agent works for ${resultset.recordset[0].VendorName} and is authorized to sell on behalf of Spark Energy or its affiliate brands.`;
            }
            else{
                var dateInactive = new Date(resultset.recordset[0].LatestDate).toLocaleDateString();
                strValid = `Invalid - The Agent ID you provided was assigned to ${resultset.recordset[0].FirstName} ${resultset.recordset[0].LastName} working for ${resultset.recordset[0].VendorName}. This Independent Sales Agent was deactivated on ${dateInactive}. Please instruct the agent to contact their manager immediately to see if they are eligible for reactivation. In addition, we will notify Spark Energy's compliance team, and they will contact the independent sales vendor.`
            }

            var objAlert = {};

            objAlert.Client = client;
            objAlert.CallDateTime = new Date();
            objAlert.AlertType = 'Employee Verification';
            objAlert.AlertDescription = 'Employee Verification';
            objAlert.AgentId = resultset.recordset[0].AgentId;
            objAlert.AgentName = resultset.recordset[0].FirstName + ' ' + resultset.recordset[0].LastName;
            objAlert.VendorId = resultset.recordset[0].VendorId;
            objAlert.VendorName = resultset.recordset[0].VendorName;
            objAlert.IsValid = resultset.recordset[0].IsActive === true? 'Valid': 'Invalid';
            objAlert.CreatedDateGMT = new Date();
            objAlert.NotificationStatus = '';

            db.TPVAlerts.save(objAlert, (err, data) => {
                if (err) console.log('error inserting into TPVAlerts. ', err);
            });
        }
        else {
            strValid = "We are unable to locate this Agent I.D. Please confirm the I.D. you provided me is correct.";
        }

        result.recordset[0].html = strValid;

        res.json({EmployeeVerification:result.recordset[0]});


    }).catch(function(err){
        console.log('err ', err)
        var Error= {
            SystemErrorMessage: err
        }
        res.json(Error);
    })

};

exports.getStateByZip = function(connection,ServiceAddress,req,res){
    if (ServiceAddress == ''){
        ServiceAddress = req.params.zipcode;
    }
    db.ZipStateCity.findOne({"zipcode": ServiceAddress},function(err,data){
        //If data is not found in mongo db use smartystreets
        if (data === null) {
            var objSS = config.smartystreets;
            var url = objSS.smartStreetsZipcodeUrl + "/lookup?auth-id=" + objSS.smartStreetsAuthId + "&zipcode=" + ServiceAddress;

            request(url, function (error, response, body) {
                if (error !== null){
                    zipcodeError("Invalid Zip Code was entered. Please correct it and submit again.", res);
                }
                else{
                    var objBody = new Array();
                    objBody = JSON.parse(body);
                    var objBody = JSON.parse(body);
                    var objZipStateCity  = objBody[0].zipcodes;

                    if (objZipStateCity == undefined){
                        //Write into mongo to store as invalid
                        var ZipStateCity = {
                            zipcode: ServiceAddress,
                            status: 'Invalid'
                        }

                        db.ZipStateCity.save(ZipStateCity, {upsert:true}, function(error, data){
                            if (error) {
                                zipcodeError("Error inserting data in the mongo db ZipStateCity collection.", res);
                            }
                        })
                        zipcodeError("Invalid Zip Code was entered. Please correct it and submit again.", res);
                    }else {

                        var latitude = objZipStateCity[0].latitude != undefined? objZipStateCity[0].latitude.toString(): '';
                        var longitude = objZipStateCity[0].longitude != undefined? objZipStateCity[0].longitude.toString(): '';

                        var ZipStateCity = {
                            city: objZipStateCity[0].default_city,
                            state_abbr: objZipStateCity[0].state_abbreviation,
                            state: objZipStateCity[0].state,
                            zipcode: objZipStateCity[0].zipcode,
                            latitude: latitude,
                            longitude: longitude
                        }

                        db.ZipStateCity.save(ZipStateCity, {upsert:true}, function(error, data){
                            if (error) {
                                zipcodeError("Error inserting data in the mongo db ZipStateCity collection.", res);
                            }else{
                                zipcodeSuccess(data, res);
                            }
                        })
                    }
                }
            });
        }
        else{ //data is found in mongo db
           // console.log('data is found in mongo db');
            if (err !== null){
                zipcodeError("Invalid Zip Code was entered. Please correct it and submit again.", res);
            }
            else{
                if (data.status){
                    if (data.status === 'Invalid'){
                        zipcodeError("Invalid Zip Code was entered. Please correct it and submit again.", res);
                    }
                }
                else {
                    zipcodeSuccess(data, res);
                }
            }
        }
    });
};

exports.btnCheck = function (connection, btn, req, res, expiry) {

    var request = new sql.Request(connection);
    request.input('btn', sql.VarChar, btn);
    request.input('expiry', sql.Int, expiry)
    request.output('result', sql.VarChar);
    var query = "if exists (select * from v1.Main m where m.btn = @btn " +
        " and (m.CallDateTime > getdate() - @expiry )" +
        " and m.Verified = '1' ) set @result = 'true' else set @result = 'false' ";
    request.query(query).then(function (resultset) {
        // console.log(resultset);
        res.json(resultset.output)
    }).catch(function (err) {
        res.json(err)
    })


}

exports.getStates = function (connection, req, res) {
    console.log('connection ',connection.config.database)
    //console.log('req ',req)
    var request = new sql.Request(connection);
    var query = 'select * from Scripts.States order by Scripts.States.StateName';

    if (connection.config.database =='spark'){
        query = 'select * from Scripts.States UNION select * from Scripts.QuestionIdentifier';
    }

    request.query(query).then(function (resultset) {
        var arrEV = [];
        resultset.recordset.forEach(function (element) {
            if (element.StateCode === 'EV') {
                arrEV.push(element);
            }
        });
        var filtered_arr = resultset.recordset.filter(r => r.StateCode !== 'EV');
        var new_arr = filtered_arr.concat(arrEV);

        res.json(new_arr);
    }).catch(function (err) {
        console.log('err ', err);
        res.json(err)
    });
}

exports.getSalesChannel = function (connection, req, res) {
    var request = new sql.Request(connection);
    var query = 'select * from Scripts.vwSalesChannel'
    request.query(query).then(function (resultset) {
        res.json(resultset.recordset);
    }).catch(function (err) {
        res.json(err)
    });
}

exports.getAllDnis = function (connection, req, res) {
    db.scripts.find({}, function(error, data){
        if (error) {
            console.log('getAllDnis error', error);
        }
        res.json(data);
    })
}

exports.createUpdateDnis = function (connection, req, res) {
    req.body._id = db.ObjectId(req.body._id)
    db.scripts.save(req.body, {upsert:true}, function(error, data){
        if (error) {
            console.log('getAllDnis error', error);
        }
        res.json(data);
    })
}

exports.createUpdateVendor = function (connection, req, res) {
    req.body._id = db.ObjectId(req.body._id)
    db.scripts.save(req.body, {upsert:true}, function(error, data){
        if (error) {
            console.log('UpdateVendor error', error);
        }
        res.json(data);
    })
}

exports.deleteDnis = function (connection, req, res) {
   // console.log('MT delete', req.params.id);
    var id = db.ObjectId(req.params.id)
    db.scripts.remove({_id:id}, function(error, data){
        if (error) {
            console.log('MT delete error', error);
        }
        console.log('MT delete data', data);
        res.json(data);
    });
}

exports.getvalidAgent = function (connection, req, res, id) {
    //console.log('param id', req.params.id);
    
    
    var request = new sql.Request(connection);
    request.input('Agentid', sql.VarChar, req.params.id);
    var query = "select * from [v1].[User] a " +
        " WHERE a.AgentId = @Agentid " +  //'mjrae'
        " and a.IsActive = 1 ";
    request.query(query).then(function (resultset) {
        //console.log('query', query);
        //console.log('resultset.recordset',resultset.recordset);
        res.json(resultset.recordset);
    }).catch(function (err) {
        console.log('getvalidagent', err);
        res.json(err);
    });


}

exports.report = function(connection,req,res,obj){
    var request= new sql.Request(connection)
    request.input('StartDate',sql.VarChar,obj.StartDate)
    request.input('EndDate',sql.VarChar,obj.EndDate)
    request.input('Ids',sql.VarChar,obj.Ids)

    request.execute('dbo.NewBilling').then(function(resultset){
        res.json(resultset)
    }).catch(function(err){
        //console.log(err)
        res.json(err)
    })

}



