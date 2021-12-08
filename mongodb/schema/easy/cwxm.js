var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;


var UserSchema  = new Schema({
    address: {type:String},  
    data:{type:Array},

});


module.exports = mongoose.model('cwxm',UserSchema);