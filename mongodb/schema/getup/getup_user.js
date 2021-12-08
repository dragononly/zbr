var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	openid: {type:String, unique: true, dropDups: true},
	nickname: {type: String}, 
	sex: {type: Number},
	city: {type: String},
	province: {type: String},
	country: {type: String},
	headimgurl: {type: String},
	privilege: {type: Array},
	
	notice_time: {type: String, default: "05:00"}, //系统将每天此时推送打卡提醒
	//{type: Array, unique:true}是保持整个数组唯一了，如何保证数组内关注的人唯一不要重复呢？
	follow_users: {type: Array},  //我的关注列表
	sign_record: {type: Array}, //每天的打卡记录
	"sign_record.sign_time":{type:String,sparse:true},
	push_morning_notice: {type: Boolean, default: true}, //注册的新用户默认推送早晨卡片, 数据库中明明是“Bool”,这里竟然不支持
	keep_days: {type: Number, default: 0}, //持续打卡天数
	register_date : {type: Date, default: Date.now}
});

module.exports = mongoose.model('getup_user', sc);