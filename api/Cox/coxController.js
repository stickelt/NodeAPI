/**
 * Created by sward on 8/3/2017.
 */
var sql = require('mssql');
var aws = require('aws-sdk');
var AWSAccessKey = "AKIAJR4LJDSIJCTKHDCQ"
var AWSSecretKey = "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"
aws.config.update({
    accessKeyId: AWSAccessKey,
    secretAccessKey: AWSSecretKey,
    region: 'us-west-2'
});

exports.getAccount = function(req,res){
    //return fro mongo the mobile account info
    var db = req.app.db ; //
    db.Cox.findOne({_id: db.ObjectId(req.params.id)},function(err,data){
        if(err) res.json(err)
        res.json(data)
    } )
};

exports.addAccount = function (connection, req, res){
    var request1 = new sql.Request(connection);
    request1.input('SalesId', sql.VarChar, req.body.salesId);
    request1.input('AccountNum', sql.VarChar, req.body.accountNumber);
    request1.input('FirstName', sql.VarChar, req.body.firstName);
    request1.input('LastName', sql.VarChar, req.body.lastName);
    request1.input('E911', sql.VarChar, req.body.e911);
    request1.output('AccountId', sql.Int, 0);

    request1.execute('[dbo].[spInsertAccount]').then(function (result) {
        var accountId = result.output.AccountId;

        var numbers = req.body.numbers;

        for (let obj of numbers){
            var local  = obj.localServiceToCox == true ? '1' : '0';
            var toll  = obj.localTollServiceToCox == true ? '1' : '0';
            var longdistance  = obj.ldServiceToCox == true ? '1' : '0';

            var request = new sql.Request(connection);

            request.input('CmKeyId', sql.Int, accountId);
            request.input('Wtn', sql.VarChar, obj.number);
            request.input('Local', sql.VarChar, local);
            request.input('LocalProviderNew', sql.VarChar, 'COX');
            request.input('Intralata', sql.VarChar, toll);
            request.input('IntralataProviderNew', sql.VarChar, 'COX');
            request.input('Interlata', sql.VarChar, longdistance);
            request.input('InterlataProviderNew', sql.VarChar, 'COX');
            request.output('TnId', sql.Int, 0);

            request.execute('[dbo].[spInsertTN]').then(function (resultTn) {
                var tnId = resultTn.output.TnId;
            }).catch(function (err) {
                console.log('res.json(err)', err);
                res.json(err);
            });
        }
        res.json(result.output);
    }).catch(function (err) {
        console.log('res.json(err)', err);
        res.json(err);
    });
};

exports.sendText = function (req, res) {

    // need specs from cox as to data they will send
    // we will use mongodb so we can just store what ever json object they send
    var db = req.app.db; // mongo db connection
    db.Cox.save(req.body, function (err, data) {
        if (err) res.json(err)
        sendtext(data)
    })


    var sendtext = function (data) {

        var sns = new aws.SNS();
        var Message = "Click to complete your enrollment for Cox communications:"
        Message += " http://4.79.184.26:8888/#/verify/" + data._id;
        var params = {}
        params.Message = Message
        params.PhoneNumber = data.MobilePhone;
        params.MessageStructure = 'text';


        sns.publish(params, function (err, textResponse) {
            if (err) console.log(err);
            //  console.log(data)
            res.json(textResponse)
        })
    }
}

