var mongoose = require('../db/db.js');
var Schema = mongoose.Schema;
var UserSchema  = new Schema({
    wx:{type:Object},
    'wx.openid':{type:String,unique:true,sparse:true},
    xf:{type:Object},
    phone_number:{type:String,unique:true,sparse:true},
    wxapp:{type:Object},
    'wxapp.openid':{type:String,unique:true,sparse:true},
    register_date : {type: Date, default: Date.now}
});
module.exports = mongoose.model('wx',UserSchema);