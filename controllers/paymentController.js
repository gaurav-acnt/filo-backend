const crypto = require("crypto")
const razorpayInstance = require("../config/razorpay");
const Payment = require("../models/Payment");
const User = require("../models/User");
const {plans} = require("../config/plans");


exports.createOrder = async (req,res) =>{
    try{
        const {planName} = req.body;
        const userId = req.user.id;

        if(!planName || !plans[planName]){
            return res.status(400).json({
                success:false,
                message:"Invalid plan"
            })

        
        }
        const plan = plans[planName]
        if(plan.amount <= 0){
            return res.status(400).json({
                success:false,
                message:"Free plan does not require payment"
            })
        }

        const order = await razorpayInstance.orders.create({
            amount:plan.amount *100,
            currency:"INR",
            receipt:`receipt_${Date.now()}`
        })

        const payment = await Payment.create({
            userId,
            planName,
            amount:plan.amount,
            currency:"INR",
            razorpayOrderId:order.id,
            status:"CREATED",
        })

        return res.status(200).json({
            success:true,
            message:"order created",
            order,
            paymentId:payment._id,
            key:process.env.RAZORPAY_KEY_ID,
        })
    }
    catch (err) {
    return res.status(500).json({ 
        success: false,
        message: err.message
    });
  }
}


exports.verifyPayment = async(req,res)=>{
    try{
        const userId = req.user.id;
        const {razorpay_order_id,razorpay_payment_id, razorpay_signature,planName}= req.body;

        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planName){
            return res.status(400).json({
                success:false,
                message:"Missing Payment details"
            })
        }

        if(!plans[planName]) {
            return res.status(400).json({
                success:false,
                message:"Invalid Plan"
            })
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

            if(expectedSignature !== razorpay_signature){
                await Payment.findOneAndUpdate(
                    {razorpayOrderId:razorpay_order_id},
                    {status:"FAILED",razorpayPaymentId:razorpay_payment_id,razorpaySignature:razorpay_signature},
                    {new:true}
                )
                return res.status(400).json({
                    success:false,
                    message:"Payment Verification Failed"
                })
            }

            const payment = await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    status: "PAID",
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                },
                { new: true }
            )

            const plan =  plans[planName];

            const user = await User.findById(userId);
            user.plan= plan.name;
            user.storageLimit = plan.storageLimit;
            await user.save();

            return res.status(200).json({
                success: true,
                message: " Payment verified & plan upgraded",
                payment,
                user: {
                    id: user._id,
                    plan: user.plan,
                    storageUsed: user.storageUsed,
                    storageLimit: user.storageLimit,
                },
            })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


exports.getMyPayments = async (req,res)=>{
    try{
        const payments = await Payment.find({userId:req.user.id}).sort({createdAt:-1})
        return res.status(200).json({
            success:true,
            payments
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

