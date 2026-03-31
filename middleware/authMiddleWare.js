const jwt = require("jsonwebtoken");

exports.authMiddleware = (req,res,next)=>{
    try{
        const token = req.headers.authorization?.split(" ")[1];

        if(!token)
            return res.status(400).json({
        success:false,
        messsage:"token missing",
    })
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    req.user= decoded;
    next();
    }catch(error){
        return res.status(500).json({
        success:false,
        message:"Invalid token"
        })
    }
}

