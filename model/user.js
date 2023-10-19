const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // username:String,
    password:String,
    email:String,
    resetPasswordToken:String,
    resetPasswordExpires:Date,
});

const User = mongoose.model("User",UserSchema)

module.exports = User;