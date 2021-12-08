var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;


var UserSchema  = new Schema({
    user : {type:String,unique:true,dropDups: true},                    //用户账号
    password: {type: String},                        //密码
    other:{type:Array},
    logindate : { type: Date},                       //最近登录时间
});


module.exports = mongoose.model('commonweal',UserSchema);