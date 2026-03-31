const Bundle = require("../models/Bundle")

exports.getBundle = async(req,res)=>{
    try{
        const {bundleId}= req.params;

        const bundle = await Bundle.findById(bundleId).populate("files");

        if(!bundle){
            return res.status(400).json({
                success:false,
                message:"Bundle not found"
            })
        }

        if (bundle.expiresAt && new Date(bundle.expiresAt) < new Date()) {
            return res.status(410).json({
                success: false,
                message: "This bundle link has expired",
            });
            }
             return res.status(200).json({
                success: true,
                bundle,
                bundleId: bundle._id,
            });
    }catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}