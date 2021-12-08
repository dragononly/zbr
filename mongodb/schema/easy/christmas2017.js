var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;


var UserSchema  = new Schema({
    verify:{type: String},                             
    disjunctor:{type: String},                            
    logindate : { type: Date},                       //最近登录时间
});


module.exports = mongoose.model('christmas2017',UserSchema);