var mongoose = require('../db/db.js');
var Schema = mongoose.Schema;
var UserSchema  = new Schema({
    out_trade_no:{type:String,unique:true,dropDups: true},
    openid:{type:String,unique:true,dropDups: true}
});
module.exports = mongoose.model('wxpay',UserSchema);