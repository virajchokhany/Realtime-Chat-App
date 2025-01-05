const mongoose = require('mongoose');
const userSchema = mongoose.Schema(
    {
        oid : {type : String, required : true, unique : true},
        name : {type:String, required : true},
        email : {type:String, required : true, unique : true},
        pic : {type:String, default : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"},
    },{
        timestamps:true
    }
);

const User = mongoose.model("User",userSchema);
module.exports = User;