
const Otp = require("../models/Otp");
const User = require("../models/User");
const {sendEmail} = require("../utils/sendEmail");
const bcrypt = require("bcrypt")

const generateOtp = ()=> Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = async (req,res) => {
    try{
        const {email} = req.body;
        if(!email)
            return res.status(400).json({
                success:false,
                message:"Email Required"
            })

            await Otp.deleteMany({email});

            const otp = generateOtp();
            const expiresAt = new Date(Date.now()+ 5*60*60*1000)

            await Otp.create({email,otp,expiresAt})
            await sendEmail(
                email,
                 "✅ Your OTP for FILO registration",
                 `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes.</p>`
            );
            res.status(200).json({
                success:true,
                message:" OTP sent successfully" 
            })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


exports.verifyOtpAndRegister = async (req,res)=> {
    try{
        const {name,email,otp,password}= req.body;

        if(!name || !email || !otp || !password)
            return res.status(400).json({
                success:false,
                message:"All Field required"
            })

            const record = await Otp.findOne({email,otp})
            if(!record)
                return res.status(400).json({
                    success:false,
                    message:"Invalid OTP"
                })

            if(new Date(record.expiresAt)< new Date()){
                return res.status(400).json({
                    success:false,
                    message:"OTP Expired"
                })
            }
            const existingUser = await User.findOne({ email });
            if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User Already Exists",
            });
            }

            const hashedPassword = await bcrypt.hash(password,10);

            const user = await User.create({
                name,
                email,
                password:hashedPassword
            })

            await Otp.deleteMany({email});
            res.status(200).json({
                success:true,
                message:" Registered successfully", user
            })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}