/**
 * Created by sward on 5/5/2017.
 */
// scripting API's  CRUD operations
var sql = require('mssql');
var config = require('../../config.js');
var config = require('../../config.js');

// This method mutates the .Data property from a string to a js object literal using JSON.parse.
var parseDirectiveAssociations = function (directiveAssociations) {
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

exports.getQuestionDirectives = function (connection, req, res) {
    var request = new sql.Request(connection);
    var query = 'SELECT * from scripts.Directives ' +
        " Order by Id";
    request.query(query).then(function (resultset) {
        res.json(resultset.recordset)
    }).catch(function (err) {
        console.log('script.directives', err);
        res.json(err)
    })
}

exports.createQuestion = function (connection, req, res) {

    var request = new sql.Request(connection);

    request.input('Name', sql.VarChar, req.body.Name);
    request.input('Description', sql.VarChar, req.body.Description);
    request.input('Verbiage', sql.VarChar, req.body.Verbiage);
    request.input('VerbiageSpanish', sql.VarChar, req.body.VerbiageSpanish);
    request.input('Condition', sql.VarChar, req.body.Condition);
    request.input('ParentId', sql.Int, req.body.ParentId);
    request.input('ParentValue', sql.VarChar, req.body.ParentValue);
    request.input('ConcernCode', sql.VarChar, req.body.ConcernCode);
    request.input('Active', sql.Bit, req.body.Active);
    request.input('HasValidation', sql.Bit, req.body.HasValidation);
    request.input('AllowModify', sql.VarChar, req.body.AllowModify);

    request.execute('Scripts.insertQuestion').then(function (result) {
        //console.log(result)
        res.json(result.recordset)
    })
}

exports.ModifyQuestion = function (connection, req, res) {

    var request = new sql.Request(connection);
    request.input('Id', sql.Int, req.body.Id);
    request.input('Name', sql.VarChar, req.body.Name);
    request.input('Description', sql.VarChar, req.body.Description);
    request.input('Verbiage', sql.VarChar, req.body.Verbiage);
    request.input('VerbiageSpanish', sql.VarChar, req.body.VerbiageSpanish);
    request.input('Condition', sql.VarChar, req.body.Condition);
    request.input('ParentId', sql.Int, req.body.ParentId);
    request.input('ParentValue', sql.VarChar, req.body.ParentValue);
    request.input('ConcernCode', sql.VarChar, req.body.ConcernCode);
    request.input('Active', sql.Bit, req.body.Active);
    request.input('HasValidation', sql.Bit, req.body.HasValidation);
    request.input('AllowModify', sql.VarChar, req.body.AllowModify);

    var query = "Update Scripts.Question " +
        " Set Name = @Name " +
        ", Description = @Description " +
        ", Verbiage = @Verbiage " +
        ", VerbiageSpanish = @VerbiageSpanish " +
        ", ParentId = @ParentId " +
        ", ParentValue = @ParentValue " +
        ", Active = @Active " +
        ", HasValidation = @HasValidation " +
        ", ConcernCode = @ConcernCode " +
        ", Condition = @Condition " +
        ", AllowModify = @AllowModify " +
        " Where  id = @Id ";

    request.query(query).then(function (resultset) {
        res.json(resultset)
    }).catch(function (err) {
        res.json('error on update of question', err)
    });
}


exports.insertDirectiveAssoc = function (connection, req, res) {


    var request = new sql.Request(connection);

    request.input('QuestionId', sql.Int, req.body.QuestionId)
    request.input('DirectiveId', sql.Int, req.body.DirectiveId)
    request.input('Data', sql.VarChar(sql.MAX), req.body.Data)
    request.input('SortOrder', sql.Int, req.body.SortOrder)
    request.execute('Scripts.insertQDA').then(function (result) {
        res.json(result.recordset)
    }).catch(function (err) {
        res.json(err)
    })
}

exports.updateDirectiveAssoc = function (connection, req, res) {
    var request = new sql.Request(connection);
    request.input('Id', sql.Int, req.body.Id)
    request.input('QuestionId', sql.Int, req.body.QuestionId)
    request.input('DirectiveId', sql.Int, req.body.DirectiveId)
    request.input('Data', sql.VarChar(sql.MAX), req.body.Data)
    request.input('SortOrder', sql.Int, req.body.SortOrder)
    request.execute('Scripts.updateQDA').then(function (result) {
        res.json(result.recordset)
    }).catch(function (err) {
        res.json(err)
    })
}

exports.deleteDirectiveAssoc = function (connection, req, res) {
    var request = new sql.Request(connection);
    var id = req.params.id;
    var query = 'delete from Scripts.QuestionDirectiveAssoc where Id=' + id;
    request.query(query).then(function (resultset) {
        res.json({Success: true});
    }).catch(function (err) {
        res.json(err)
    });
}

exports.getDirectiveAssoc = function (connection, req, res) {
    var request = new sql.Request(connection);
    request.input('QuestionId', sql.VarChar, req.params.questionid);
    request.execute('[Scripts].[getDirectiveAssoc]').then(function (result) {
        parseDirectiveAssociations(result.recordset);
        res.json(result.recordset)
    })
        .catch(function (err) {
            res.json(err)
        });
}


exports.getQuestions = function (connection, req, res) {
    var request = new sql.Request(connection);
    var query = 'select * from Scripts.Question'
    request.query(query).then(function (resultset) {
        res.json(resultset.recordset);
    }).catch(function (err) {
        res.json(err)
    });
}


exports.createScriptQuestion = function (connection, req, res) {
    var request = new sql.Request(connection);
    request.input('QtypeId', sql.Int, req.body.QtypeId);
    request.input('StateCode', sql.VarChar, req.body.StateCode);
    request.input('SalesChannelId', sql.Int, req.body.SalesChannelId);
    request.input('QuestionId', sql.Int, req.body.QuestionId);
    request.input('ScriptOrder', sql.Int, req.body.ScriptOrder);
    request.input('Active', sql.Bit, req.body.Active);
    request.input('SaveTpv', sql.Bit, req.body.SaveTpv);
    request.input('IsLastQuestion', sql.Bit, req.body.IsLastQuestion);

   var query = "insert into Scripts.ScriptQuestions( QtypeId, StateCode, SalesChannelId, QuestionId,ScriptOrder,Active,SaveTpv, IsLastQuestion)" +
        " VALUES(@QtypeId, @StateCode, @SalesChannelId, @QuestionId,@ScriptOrder,@Active, @SaveTpv, @IsLastQuestion) ; " +
        "Select * from Scripts.vwScriptQuestions where ScriptId = SCOPE_IDENTITY()";
    request.query(query).then(function (resultset) {
        res.json(resultset)
    }).catch(function (err) {
        res.json(err)
    });
}

exports.ModifyScriptQuestion = function (connection, req, res) {
    var request = new sql.Request(connection);
    request.input('QtypeId', sql.Int, req.body.QtypeId);
    request.input('QuestionId', sql.Int, req.body.QuestionId);
    request.input('ScriptId', sql.Int, req.body.ScriptId);
    request.input('ScriptOrder', sql.Int, req.body.ScriptOrder);
    request.input('Active', sql.Bit, req.body.Active);
    request.input('SaveTpv', sql.Bit, req.body.SaveTpv);
    request.input('IsLastQuestion', sql.Bit, req.body.IsLastQuestion);

    var query = "Update Scripts.ScriptQuestions " +
        " Set QtypeId = @QtypeId " +
        ", QuestionId = @QuestionId " +
        ", ScriptOrder = @ScriptOrder " +
        ", Active = @Active " +
        ", SaveTpv = @SaveTpv " +
        ", IsLastQuestion = @IsLastQuestion " +
        " Where ScriptId = @ScriptId "

    request.query(query).then(function (resultset) {
        res.json(resultset)
    }).catch(function (err) {
        res.json(err)
    });

}


exports.getScriptQuestions = function (connection, req, res) {
    const result1 = new sql.Request(connection)
        .input('statecode', sql.VarChar, req.params.statecode)
        .input('saleschannel', sql.Int, req.params.saleschannelid)
        .execute('[Scripts].[getCompleteScriptQuestionInformation]')
        .then(function (result) {
            //Get distinct Questions
            var distinctQuestionArray = (function (a) {
                var seen = {};
                return a.filter(function (e) {
                    return seen[e.QuestionId] ? false : (seen[e.QuestionId] = true);
                }).map(function (e) {
                    return {
                        ScriptId: e.ScriptId,
                        ScriptOrder: e.ScriptOrder,
                        Active: e.Active,
                        SaveTpv: e.SaveTpv,
                        QType: e.QType,
                        SalesChannel: e.SalesChannel,
                        Verbiage: e.Verbiage,
                        VerbiageSpanish: e.VerbiageSpanish,
                        QtypeId: e.QtypeId,
                        SalesChannelId: e.SalesChannelId,
                        StateName: e.StateName,
                        StateCode: e.StateCode,
                        QuestionId: e.QuestionId,
                        ConcernCode: e.ConcernCode,
                        ParentId: e.ParentId,
                        ParentValue: e.ParentValue,
                        HasValidation: e.HasValidation,
                        AllowModify: e.AllowModify,
                        VerbiageObj: {"en": e.Verbiage, "es": e.VerbiageSpanish},
                        Condition: e.Condition,
                        IsLastQuestion: e.IsLastQuestion,
                        Concern: e.Concern,
                        QuestionIdentifierCode: e.QuestionIdentifierCode,
                        QuestionIdentifierName: e.QuestionIdentifierName,
                    }
                });
            })(result.recordset);

            // Filtered array by Question ID
            distinctQuestionArray.forEach(function (valDistinctQuestion) {

                var arrByQuestionId = result.recordset.filter((item => item.QuestionId == valDistinctQuestion.QuestionId));

                //Now we have array of filtered records we can loop through it and build directives for each question
                var questionDirectives = [];

                arrByQuestionId.forEach(function (val) {
                    if (val.DirectiveId) {
                        var questionDirective = {};
                        questionDirective.Id = val.qdaId;
                        questionDirective.QuestionId = val.QuestionId;
                        questionDirective.DirectiveId = val.DirectiveId;
                        questionDirective.DirectiveName = val.DirectiveName;
                        questionDirective.Data = JSON.parse(val.Data);
                        questionDirective.SortOrder = val.SortOrder;
                        questionDirectives.push(questionDirective);
                    }
                })
                valDistinctQuestion.directives = questionDirectives;
            });
            res.json(distinctQuestionArray);
        })
}


exports.getScriptQuestionsForAdmin = function (connection, req, res) {
     (async function () {
        try {
            let result1 = await connection.request()
                .input('statecode', sql.VarChar, req.params.statecode)
                .input('saleschannel', sql.Int, req.params.saleschannelid)
                .execute('[Scripts].[getScriptQuestionsAdminTool]')

            //Get distinct Questions
            var distinctQuestionArray = (function (a) {
                var seen = {};
                return a.filter(function (e) {
                    return seen[e.QuestionId] ? false : (seen[e.QuestionId] = true);
                }).map(function (e) {
                    return {
                        ScriptId: e.ScriptId,
                        ScriptOrder: e.ScriptOrder,
                        Active: e.Active,
                        SaveTpv: e.SaveTpv,
                        QType: e.QType,
                        SalesChannel: e.SalesChannel,
                        Verbiage: e.Verbiage,
                        VerbiageSpanish: e.VerbiageSpanish,
                        QtypeId: e.QtypeId,
                        SalesChannelId: e.SalesChannelId,
                        StateName: e.StateName,
                        StateCode: e.StateCode,
                        QuestionId: e.QuestionId,
                        ConcernCode: e.ConcernCode,
                        ParentId: e.ParentId,
                        ParentValue: e.ParentValue,
                        HasValidation: e.HasValidation,
                        IsLastQuestion: e.IsLastQuestion,
                        Concern: e.Concern,
                        QuestionIdentifierCode: e.QuestionIdentifierCode,
                        QuestionIdentifierName: e.QuestionIdentifierName,
                    }
                });
            })(result1.recordset);

            // Filtered array by Question ID
            distinctQuestionArray.forEach(function (valDistinctQuestion) {

                var arrByQuestionId = result1.recordset.filter((item => item.QuestionId == valDistinctQuestion.QuestionId));

                //Now we have array of filtered records we can loop through it and build directives for each question
                var questionDirectives = [];

                arrByQuestionId.forEach(function (val) {
                    if (val.DirectiveId) {
                        var questionDirective = {};
                        questionDirective.Id = val.qdaId;
                        questionDirective.QuestionId = val.QuestionId;
                        questionDirective.DirectiveId = val.DirectiveId;
                        questionDirective.DirectiveName = val.DirectiveName;
                        questionDirective.Data = val.Data;
                        questionDirective.SortOrder = val.SortOrder;
                        questionDirectives.push(questionDirective);
                    }
                })
                valDistinctQuestion.directives = questionDirectives;
            });
            res.json(distinctQuestionArray);

        } catch (err) {
            // ... error checks
            if (err) console.log(err)
        }

        sql.close()

    })()
}




