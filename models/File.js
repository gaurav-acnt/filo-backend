const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        fileName:{
            type:String,
            required:true
        },
        fileUrl:{
            type:String,
            required:true
        },
        publicId:{
            type:String,
            required:true
        },
        fileSize:{
            type:Number,
            required:true,
        },
        fileType:{
            type:String,
            required:true,
        },
        uploadedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        downloads:{
            type:Number,
            default:0
        },
        password:{
            type:String,
            default:null
        },
        expiresAt:{
            type:Date,
            default:null,
        }
    },
    {timestamps:true}
);

module.exports = mongoose.model("File",fileSchema);
