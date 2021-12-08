var mongoose = require('../db/db.js');

var Schema = mongoose.Schema;

var UserSchema  = new Schema({

    lakala : {type:Object},                 
    gzby : {type:Object},                   //广州百益日志
    register_date : {type: Date, default: Date.now},// time
    gzbyip:{type:String}
   
  
});


module.exports = mongoose.model('assembled',UserSchema);