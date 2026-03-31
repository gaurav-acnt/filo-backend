const user = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const {sendEmail}= require("../utils/sendEmail");
const { cloudinary } = require("../config/cloudinary");
const Bundle = require("../models/Bundle")
const File = require("../models/File")

// registering
exports.register = async(req,res)=>{
    try{
        const {name,email,password}= req.body;

        if(!name || !email || !password)
            return res.status(400).json({
                success:false,
                message:"All field are required"
            })

        const existing = await User.findOne({email})
        if(existing)
            return res.status(400).json({
                success:false,
                message:"user already exists"
            })

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password:hashedPassword,
        })
        return res.status(200).json({
            success:true,
            message:"registered successfully",
            user:{id:user._id , name:user.name , email:user.email}
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//login
exports.login = async(req,res)=>{
    try{
        const {email,password}= req.body;

        if(!email || !password)
            return res.status(400).json({
         success:false,
         message:"all field are required"
        });

        const user  = await User.findOne({email: email.toLowerCase()});
        if(!user)
            return res.status(400).json({
                success:false,
                message:"Invalid Email",
            })
        
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch)
            return res.status(400).json({
                success:false,
                message:"Incorrect Password"
            })

        const token = jwt.sign(
            {
            id:user._id,
            email:user.email
            },
        process.env.JWT_SECRET,
        {expiresIn:"7d"}
        );
        return res.status(200).json({
            success:true,
            message:"Login Successfull",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }
        })
    }
    catch(error){
    return res.status(500).json({
        success:false,
        message:error.message
    })
    }
};

//forgot passwrd
exports.forgotPassword = async(req,res)=>{
    try{
        const {email}= req.body;
        const user = await User.findOne({email});

        if(!user) 
            return res.status(400).json({
                success:false,
                message:"User Not Found"
            })

        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken= token;
        user.resetTokenExpiry = new Date(Date.now() + 15*60*1000);
        await user.save();

        const link = `${process.env.FRONTEND_URL}/reset-password/${token}`

        await sendEmail(
            email,
            "🔑 Reset Password - FILO",
            `<p>Click to reset password:</p><a href="${link}">${link}</a>`
   
        )
        res.status(200).json({
            success:true,
            message:"Reset Link sent to Email"
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }

}

//reset password
exports.resetPassword = async(req,res)=>{
    try{
        const {token,newPassword}= req.body;

        const user = await User.findOne({
            resetToken:token,
            resetTokenExpiry:{$gt:new Date()}
        })

        if(!user)
            return res.status(400).json({
                success:false,
                message:"Token Expired/Invalid"
            })

        user.password = await bcrypt.hash(newPassword,10);
        user.resetToken = null;
        user.resetTokenExpiry= null;

        await user.save();
        res.status(200).json({
            success:true,
            message:"✅ Password reset successful"
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


//change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password",
      });
    }

    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//delete account 
exports.deleteAccount = async (req,res)=>{
    try{
        const { password }  = req.body;
        if(!req.user?.id) 
        return res.status(401).json({
            success:false,
            message:"Unauthorized",
        })

        if (!password) {
        return res.status(400).json({
            success: false,
            message: "Password is required",
        });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
        }

        const isMatch= await bcrypt.compare(password,user.password);

        if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Incorrect password",
        });
        }

        const files = await File.find({ uploadedBy: user._id });

        for (const file of files) {
       
        await cloudinary.uploader.destroy(file.publicId, { resource_type: "raw" });
        await cloudinary.uploader.destroy(file.publicId, { resource_type: "video" });
        await cloudinary.uploader.destroy(file.publicId, { resource_type: "image" });
        }

      
        await File.deleteMany({ uploadedBy: user._id });
        await Bundle.deleteMany({ createdBy: user._id });

       
        await User.findByIdAndDelete(user._id);

        return res.status(200).json({
        success: true,
        message: " Account deleted successfully",
        });

    }catch(error){
        return res.status(500).json({
            status:false,
            message:"Internal Server Error "

        })
    }
}