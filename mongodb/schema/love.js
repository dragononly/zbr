var mongoose = require('../db/db.js');
var Schema = mongoose.Schema;
var UserSchema  = new Schema({
    medata:{type:Array},
    user:{type:String,unique:true,sparse:true},  

   
});
module.exports = mongoose.model('hollow',UserSchema);