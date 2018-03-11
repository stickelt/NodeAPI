var sql = require('mssql')

exports.loadnewtpv = function(connection, req,res){
    var main = req.body ;
    var tn = req.body.TN ;
    var required = [ "BillName","SpokeTo","State","RepId","Business","OrderReferenceNumber"]


    var missing_fields = null
    required.forEach( key => {
       if( Object.keys(main).indexOf(key) === -1){
           missing_fields += key + " "
       }
    })

    if(missing_fields != null){
        var message = "The following required fields are missing " + missing_fields
        return res.send(message.replace('null',''))
    }


// Insert for main
    var request = new sql.Request(connection);
    request.input("BillName", sql.VarChar, main.BillName );
    request.input("SpokeTo", sql.VarChar, main.SpokeTo);
    request.input("RepId", sql.VarChar, main.RepId);
    request.input("State", sql.VarChar, main.State);
    request.input("Business", sql.VarChar, main.Business ? main.Business : '0' );
    request.input("CompanyName", sql.VarChar, main.CompanyName ? main.CompanyName : '' );

    var query = "insert into tblMain(BillName, SpokeTo, RepId, State, Business, CompanyName) " +
        "values(@BillName,@SpokeTo,@RepId,@State,@Business,@CompanyName) ; " +
        "select SCOPE_IDENTITY() as id"

    request.query(query).then( result => {
        var ID = result.recordset[0].id ;

        tn.forEach(t => {
            var requestTN = new sql.Request(connection);
            requestTN.input("MainId", sql.Int, ID)
            requestTN.input("Wtn" ,sql.VarChar, t.Wtn)
            requestTN.input("TN_DialTone" ,sql.VarChar, t.TN_DialTone ? t.TN_DialTone : '0')
            requestTN.input("TN_Intralata" ,sql.VarChar, t.TN_Intralata ? t.TN_Intralata : '0' )
            requestTN.input("TN_Interlata" ,sql.VarChar, t.TN_Interlata ? t.TN_Interlata : '0')
            requestTN.input("TN_LocalTollFreeze" ,sql.VarChar, t.TN_LocalTollFreeze ? t.TN_LocalTollFreeze : '0')
            requestTN.input("TN_AccessLineFreeze" ,sql.VarChar, t.TN_LocalTollFreeze ? t.TN_AccessLineFreeze : '0')
            requestTN.input("TN_AddPicFreeze" ,sql.VarChar, t.TN_AddPicFreeze ? t.TN_AddPicFreeze : '0')
            requestTN.input("TN_RemAccessLineFreeze" ,sql.VarChar, t.TN_RemAccessLineFreeze ? t.TN_RemAccessLineFreeze : '0')
            requestTN.input("TN_RemPicFreeze" ,sql.VarChar, t.TN_RemPicFreeze ? t.TN_RemPicFreeze : '0')
            requestTN.input("TN_VoIPE911" ,sql.VarChar,  t.TN_VoIPE911 ? t.TN_VoIPE911 : '0')
            requestTN.input("TN_VoIPLocalService" ,sql.VarChar, t.TN_VoIPLocalService ? t.TN_VoIPLocalService : '0')
            var query = "insert into tblTn(MainId,Wtn, TN_DialTone, TN_Intralata, TN_Interlata, TN_AccessLineFreeze, " +
                "TN_LocalTollFreeze ,TN_AddPicFreeze ,TN_RemAccessLineFreeze,TN_RemPicFreeze,TN_VoIPE911, TN_VoIPLocalService) " +
                "Values(@MainId,@Wtn, @TN_DialTone, @TN_Intralata, @TN_Interlata, @TN_AccessLineFreeze, "  +
                 "@TN_LocalTollFreeze ,@TN_AddPicFreeze ,@TN_RemAccessLineFreeze,@TN_RemPicFreeze,@TN_VoIPE911, @TN_VoIPLocalService)"
            requestTN.query(query).then( result => {
                console.log(result)
            })

        })
        res.json({"RecordLocator":ID,"OrderReferenceNumber":req.body.OrderReferenceNumber}) ;
    })


}