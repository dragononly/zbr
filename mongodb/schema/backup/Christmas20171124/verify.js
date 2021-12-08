var mongoose = require('../db/db.js');

var Schema = mongoose.Schema;

var verify  = new Schema({

    username : { type: String },                    //用户账号
    userpwd: {type: String},                        //密码
    userage: {type: Number},                        //年龄
    logindate : { type: Date},                       //最近登录时间
    test:{type: String}
});



module.exports = mongoose.model('verify',verify);