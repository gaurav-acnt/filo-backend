const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name: {
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        password:{
            type:String,
            required:true,
        },
        resetToken:{
            type:String,
            default:null,
        },
        resetTokenExpiry:{
            type:Date,
            default:null,
        },
        storageUsed:{
            type:Number,
            default:0
        },
        storageLimit:{
            type:Number,
            default:1 *1024*1024*1024
        },
        plan:{
            type:String,
            default:"FREE"
        },
        
    },
    {timestamps:true},
);
module.exports = mongoose.model("User",userSchema);