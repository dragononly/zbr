var mongoose = require('../db/db.js');

var Schema = mongoose.Schema;

var UserSchema  = new Schema({

    user : {type:String,unique:true,dropDups: true},                    //用户账号
    pwd: {type: String},                        //密码
    zone:{type: String},                             //cloud zone
    zoneMax:{type: String},                             //cloud zone
    phone:{type: String,unique:true,sparse:true},
    agio:{type:Object},
    store: {type: String},                        //密码
    regdate : { type: Date},                       //最近登录时间
    jd:{type:Object},
    skyadmin: {type: String,default: "user"}, 
    collect:{type:Object},
    other:{type:Object}
});


module.exports = mongoose.model('User',UserSchema);