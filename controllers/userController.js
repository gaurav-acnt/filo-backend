const User = require("../models/User");
const user = require("../models/User");

exports.searchUsers = async(req,res)=>{
    try{
        const {q}=req.query;

        if(!q || q.trim().length <2 ){
            return res.status(400).json({
                success:false,
                message: "Search query must be atleast 2 character"
            })
        }
        const users= await User.find({
            $or:[
                {name:{$regex : q, $options: "i" }},
                 { email: { $regex: q, $options: "i" } },
            ]
        }).select("_id name email ");
         const filtered = users.filter((u) => u._id.toString() !== req.user.id);
         return res.status(200).json({
            success: true,
            users: filtered 
        });
    }catch (error) {
        console.log("search users error:",error)
    return res.status(500).json({ 
        success: false,
        message: error.message
     });
  }
}


exports.getMyProfile= async (req,res)=>{
    try{
        const user = await User.findById(req.user.id).select("-password");

        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }

        return res.status(200).json({
            success:true,
            user:{
                id:user._id,
                name: user.name,
                email:user.email,
                plan:user.plan,
                storageUsed:user.storageUsed,
                storageLimit:user.storageLimit,
                createdAt:user.createdAt,
            },
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message || "Couldn't fetch user profile "
        })
    }
}




