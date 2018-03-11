'use strict' ;
var sql = require('mssql');
var dateFormat = require('dateformat');

exports.getCustomer = function(connection,tn,req,res){
    console.log('tn', tn);
    var request = new sql.Request(connection);
    request.input('tn',sql.VarChar,tn)
    //var query = 'select  * from tblE911BrightPatternLoadFile ' +
    //    ' where TN = @tn';
   var query = 'SELECT * FROM [dbo].[tblE911BrightPatternLoadFile]T1 ' +    
        'WHERE [E911BrightPatternLoadFileId] = ( ' +
            'SELECT max([E911BrightPatternLoadFileId]) ' +
            'FROM [dbo].[tblE911BrightPatternLoadFile]T2 ' +
            ' WHERE T2.tn = @tn)';
    console.log(query);
    request.query(query).then(function(resultset){
       console.log(resultset)
        res.json(resultset.recordset)
    }).catch(function(err){
        console.log('res.json(err)', err);
        res.json(err)
    })

}

exports.customerUpdate =  function(connection,req,res){
    var request = new sql.Request(connection);
    
    console.log('req.body', req.body);

    request.input('E911BrightPatternLoadFileId', sql.Int, req.body.Id);
    request.input('TN',sql.VarChar,req.body.ph);
    request.input('CallDisposition',sql.VarChar,req.body.Verbiage);
    request.input('CallDispositionCode',sql.VarChar,req.body.Number);
    var now = new Date();
    var sqlDateStr = dateFormat(now, "yyyy-mm-dd'T'HH:MM:ss");

    var query = "Update [dbo].[tblE911BrightPatternLoadFile] " +
            " Set CallDisposition = @CallDisposition " +
            ", CallDispositionCode = @CallDispositionCode " +
            ", CallTime =  '" + sqlDateStr + "'" +
            " Where E911BrightPatternLoadFileId = @E911BrightPatternLoadFileId "
    
    request.input('WavName', sql.VarChar, req.body.WavName);
    //request.input('StartTime', sql.DateTime, req.body.StartTime);
        
    var sqlStartDateTime = dateFormat(req.body.StartTime, "yyyy-mm-dd'T'HH:MM:ss");
    request.input('AgentId', sql.VarChar, req.body.AgentId);
    request.input('AgentName', sql.VarChar, req.body.AgentName);

    var query2 = "INSERT into [dbo].[tblE911InboundWav] " +
        "(E911BrightPatternLoadFileId, WavName, StartTime, EndTime, AgentId, AgentName) " +
        " VALUES(@E911BrightPatternLoadFileId, @WavName, '" + sqlStartDateTime + "'" +
        ",'" + sqlDateStr + "', @AgentId, @AgentName);"
    
    console.log(query2);

    request.query(query).then(function(resultset){
        console.log('resultset node', resultset);
        request.query(query2).then(function(resultset2){
            console.log('inner wav inserted', resultset2);
        }, function(err){
            console.log('inner wav query failed', err);
        });
        
        res.json(resultset);
        
    }).catch(function(err){
        console.log('err node', err);
        res.json(err)
    })

}

//do not do this
exports.createWav  = function(connection,req,res){

    console.log('exports.createQuestion', req);

    var request = new sql.Request(connection);
    var query = "insert into Question( Name, Description, Verbiage, VerbiageSpanish,Active )" +
        " VALUES(@Name,@Description, @Verbiage, @VerbiageSpanish, @Active) ; " +
        "Select scope_identity() as QuestionId"
    request.input('Name',sql.VarChar,req.body.Name);
    request.input('Description',sql.VarChar,req.body.Description);
    request.input('Verbiage',sql.VarChar,req.body.Verbiage);
    request.input('VerbiageSpanish',sql.VarChar,req.body.VerbiageSpanish);
    request.input('Active',sql.Bit,req.body.Active);
    request.input('LabelEnglish',sql.VarChar,req.body.LabelEnglish);
    request.input('LabelSpanish',sql.VarChar,req.body.LabelSpanish);
  
    request.query(query).then(function(resultset){
        //console.log(resultset)
        res.json(resultset)
    }).catch(function(err){
        res.json(err)
    })
}


/////////////////////////////////////////////////////////
exports.btnCheck = function(connection,btn ,req,res,expiry){

    var request = new sql.Request(connection);
    request.input('btn',sql.VarChar,btn);
    request.input('expiry',sql.Int, expiry)
    request.output('result',sql.VarChar);
    var query = "if exists (select * from v1.Main m where m.btn = @btn " +
        " and (m.CallDateTime > getdate() - @expiry )" +
        " and m.Verified = '1' ) set @result = 'true' else set @result = 'false' ";
    request.query(query).then(function(resultset){
       // console.log(resultset);
        res.json(resultset.output)
    }).catch(function(err){
        res.json(err)
    })


}

exports.getStates = function(connection, req,res){
    var request = new sql.Request(connection);
    var query = 'select * from States'
    request.query(query).then(function(resultset){
        res.json(resultset.recordset);
    }).catch(function(err){
        res.json(err)
    });
}











