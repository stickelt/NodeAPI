/**
 * Created by sward on 5/3/2017.
 */
'use strict';
var config = {}
var mongoConnection = 'mongodb://caltech:KPEWyP5cnjs9Eu5f@calibrus-shard-00-00-ll0rc.mongodb.net:27017,calibrus-shard-00-01-ll0rc.mongodb.net:27017,calibrus-shard-00-02-ll0rc.mongodb.net:27017/TPV?ssl=true&replicaSet=Calibrus-shard-0&authSource=admin'
var mongoOplog = 'mongodb://stephen:Neur0mancer@calibrus-shard-00-00-ll0rc.mongodb.net:27017,calibrus-shard-00-01-ll0rc.mongodb.net:27017,calibrus-shard-00-02-ll0rc.mongodb.net:27017/local?ssl=true&replicaSet=Calibrus-shard-0&authSource=admin'
var database = {}
var tmpsql2 = '10.100.40.210'
var tmpsql5 = '10.100.40.208'
var kyrsql1 = '10.100.41.10'

var devsql2 = '10.100.40.111'

database.spark = {}
database.spark.server = tmpsql2
database.spark.database = 'spark'
database.spark.user = 'calwrite'
database.spark.password = 'wsql2w'

database.calibrus = {}
database.calibrus.server = tmpsql2
database.calibrus.database = 'calibrus'
database.calibrus.user = 'calwrite'
database.calibrus.password = 'wsql2w'
database.calibrus.requestTimeout = '85000';

database.clearview = {}
database.clearview.server = tmpsql2
database.clearview.database = 'clearview'
database.clearview.user = 'calwrite'
database.clearview.password = 'wsql2w'

database.liberty = {}
database.liberty.server = tmpsql2
database.liberty.database = 'liberty'
database.liberty.user = 'calwrite'
database.liberty.password = 'wsql2w'

database.constellation = {}
database.constellation.server = tmpsql2
database.constellation.database = 'constellation'
database.constellation.user = 'calwrite'
database.constellation.password = 'wsql2w'

database.champion = {}
database.champion.server = tmpsql2
database.champion.database = 'championenergy'
database.champion.user = 'calwrite'
database.champion.password = 'wsql2w'

database.frontier = {}
database.frontier.server = tmpsql2
database.frontier.database = 'frontier'
database.frontier.user = 'calwrite'
database.frontier.password = 'wsql2w'

database.acsalaska = {}
database.acsalaska.server = tmpsql2
database.acsalaska.database = 'acsalaskatelecom'
database.acsalaska.user = 'calwrite'
database.acsalaska.password = 'wsql2w'

database.bellsouth = {}
database.bellsouth.server = tmpsql2
database.bellsouth.database = 'bellsouth'
database.bellsouth.user = 'calwrite'
database.bellsouth.password = 'wsql2w'

database.centurylinkloa = {}
database.centurylinkloa.server = tmpsql2
database.centurylinkloa.database = 'centurylinkloa'
database.centurylinkloa.user = 'calwrite'
database.centurylinkloa.password = 'wsql2w'

database.centurytel = {}
database.centurytel.server = tmpsql2
database.centurytel.database = 'centurytel'
database.centurytel.user = 'calwrite'
database.centurytel.password = 'wsql2w'

database.cox = {}
database.cox.server = tmpsql2
database.cox.database = 'cox'
database.cox.user = 'calwrite'
database.cox.password = 'wsql2w'
database.cox.requestTimeout = 60000

database.gci = {}
database.gci.server = tmpsql2
database.gci.database = 'gci'
database.gci.user = 'calwrite'
database.gci.password = 'wsql2w'

database.merrymaids = {}
database.merrymaids.server = tmpsql2
database.merrymaids.database = 'merrymaids'
database.merrymaids.user = 'calwrite'
database.merrymaids.password = 'wsql2w'

database.lesliespool = {}
database.lesliespool.server = tmpsql2
database.lesliespool.database = 'lesliespool'
database.lesliespool.user = 'calwrite'
database.lesliespool.password = 'wsql2w'

database.qwesttpv = {}
database.qwesttpv.server = tmpsql2
database.qwesttpv.database = 'qwesttpv'
database.qwesttpv.user = 'calwrite'
database.qwesttpv.password = 'wsql2w'

database.sbc = {}
database.sbc.server = tmpsql2
database.sbc.database = 'sbc'
database.sbc.user = 'calwrite'
database.sbc.password = 'wsql2w'

database.att = {}
database.att.server = tmpsql5
database.att.database = 'att'
database.att.user = 'calwrite'
database.att.password = 'wsql5w'
database.att.options = {
    tdsVersion: "7_1"
}

database.chubb = {}
database.chubb.server = tmpsql5
database.chubb.database = 'chubb'
database.chubb.user = 'calwrite'
database.chubb.password = 'wsql5w'
database.chubb.options = {
    tdsVersion: "7_1"
}

database.hagerty = {}
database.hagerty.server = tmpsql5
database.hagerty.database = 'hagerty'
database.hagerty.user = 'calwrite'
database.hagerty.password = 'wsql5w'
database.hagerty.options = {
    tdsVersion: "7_1"
}

database.miconnection = {}
database.miconnection.server = tmpsql5
database.miconnection.database = 'MiConnection'
database.miconnection.user = 'calwrite'
database.miconnection.password = 'wsql5w'
database.miconnection.options = {
    tdsVersion: "7_1"
}




database.society = {}
database.society.server = tmpsql5
database.society.database = 'society'
database.society.user = 'calwrite'
database.society.password = 'wsql5w'
database.society.options = {
    tdsVersion: "7_1"
}

database.texpo = {}
database.texpo.server = tmpsql5
database.texpo.database = 'texpo'
database.texpo.user = 'calwrite'
database.texpo.password = 'wsql5w'
database.texpo.options = {
    tdsVersion: "7_1"
}


database.pbx = {}
database.pbx.requestTimeout = 120000
database.pbx.server = kyrsql1
database.pbx.database = 'i3_eic'
database.pbx.user = 'sa'
database.pbx.password = '';
database.pbx.options = {
    tdsVersion: "7_1"
}

config.database = database;
config.mongo = mongoConnection;
config.mongoOplog = mongoOplog;
config.secret = 'ApqvbY789=AQ';

config.smartystreets = {
    smartStreetsDomainName: 'smartystreets.com',
    smartStreetsZipcodeUrl: 'https://us-zipcode.api.smartystreets.com',
    smartStreetsAuthId: '30044805091098764',
    service: 'smartyStreetsService'
}

module.exports = config;


