const mongoose = require("mongoose");

const bundleSchema = new mongoose.Schema(
    {
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        files: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "File" 
        }],
        expiresAt: { 
            type: Date,
            default: null 
            },
        password: { 
            type: String, 
            default: null
        },
        },
        { timestamps: true }
)

module.exports = mongoose.model("Bundle",bundleSchema)