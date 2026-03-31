const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        planName:{
            type:String,
            required:true,
        },
        amount:{
            type:Number,
            required:true,
        },
        currency:{
            type:String,
            default:"INR"
        },
        razorpayOrderId:{
            type:String,
            required:true,
        },
        razorpayPaymentId:{
            type:String,
            default:null,
        },
        razorpaySignature:{
            type:String,
            default:null,
        },
        status:{
            type:String,
            enum:["CREATED","PAID","FAILED"],
            default:"CREATED",
        }
    },
    {timestamps:true}
)
module.exports = mongoose.model("Payment",paymentSchema)

