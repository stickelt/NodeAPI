/**
 * Created by sward on 9/13/2017.
 */
'use strict';

var sql = require('mssql');
var config = require('./config');

module.exports = function(app) {

    app.connectionLiberty = new sql.ConnectionPool(config.database.liberty, function (err) {
         if (err)  console.log('liberty',err)

    });

    app.connectionSpark = new sql.ConnectionPool(config.database.spark, function (err) {
        if (err)  console.log('spark',err)

    });

    app.connectionAcsAlaska = new sql.ConnectionPool(config.database.acsalaska, function (err) {
       if (err)  console.log('acsalaska',err)

    });

    app.connectionAtt = new sql.ConnectionPool(config.database.att, function (err) {
       if (err)  console.log('att',err)

    });
    app.connectionBellSouth = new sql.ConnectionPool(config.database.bellsouth, function (err) {
       if (err)  console.log('bellsouth',err)

    });

    app.connectionCenturyLinkLoa = new sql.ConnectionPool(config.database.centurylinkloa, function (err) {
       if (err)  console.log('centurylinkloa',err)

    });

    app.connectionCenturyTel = new sql.ConnectionPool(config.database.centurytel, function (err) {
       if (err)  console.log('centurytel',err)

    });

    app.connectionChampion = new sql.ConnectionPool(config.database.champion, function (err) {
       if (err)  console.log('champion',err)

    });

    app.connectionChubb = new sql.ConnectionPool(config.database.chubb, function (err) {
       if (err)  console.log('chubb',err)

    });

    app.connectionClearview = new sql.ConnectionPool(config.database.clearview, function (err) {
       if (err)  console.log('clearview',err)

    });

    app.connectionConstellation = new sql.ConnectionPool(config.database.constellation, function (err) {
       if (err)  console.log('constellation',err)

    });

    app.connectionCox = new sql.ConnectionPool(config.database.cox, function (err) {
       if (err)  console.log('cox', err)

    });

    app.connectionFrontier = new sql.ConnectionPool(config.database.frontier, function (err) {
       if (err)  console.log('frontier',err)

    });

    app.connectionGci = new sql.ConnectionPool(config.database.gci, function (err) {
       if (err)  console.log('gci',err)

    });

    app.connectionHagerty = new sql.ConnectionPool(config.database.hagerty, function (err) {
       if (err)  console.log('hagerty',err)

    });

    app.connectionLesliePool = new sql.ConnectionPool(config.database.lesliespool, function (err) {
       if (err)  console.log('lesliePool', err)

    });

    app.connectionMerryMaids = new sql.ConnectionPool(config.database.merrymaids, function (err) {
       if (err)  console.log('merrymaids',err)

    });

    app.connectionMiConnection = new sql.ConnectionPool(config.database.miconnection, function (err) {
       if (err)  console.log('miConnection',err)

    });

    app.connectionQwestTpv = new sql.ConnectionPool(config.database.qwesttpv, function (err) {
       if (err)  console.log('qwest',err)

    });

    app.connectionSbc = new sql.ConnectionPool(config.database.sbc, function (err) {
       if (err)  console.log('sbc',err)

    });

    app.connectionSociety = new sql.ConnectionPool(config.database.society, function (err) {
       if (err)  console.log('society',err)

    });

    app.connectionTexpo = new sql.ConnectionPool(config.database.texpo, function (err) {
       if (err)  console.log('texpo',err)

     app.connectionPbx = new sql.ConnectionPool(config.database.pbx , function (err) {
        if (err)  console.log('pbx',err)
     })

    });



}
