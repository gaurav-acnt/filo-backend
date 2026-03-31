
const File = require("../models/File");
const {cloudinary }= require("../config/cloudinary");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/sendEmail");
const User = require("../models/User");
const Bundle = require("../models/Bundle");



exports.uploadFile = async(req,res) => {
    try{
        if(!req.file)
            return res.status(400).json({
                success:false,
                message:"No file uploaded"
            })

        const user= await User.findById(req.user.id);
        if(user.storageUsed + req.file.size > user.storageLimit){
            return res.status(400).json({
                success:false,
                message:"Storage Full, Upgrade your plan to upload more files"
            })
        }
        const isPdf = req.file.mimetype === "application/pdf";
        const result = await cloudinary.uploader.upload(req.file.path,{
            resource_type: isPdf ? "raw" : "auto",
            folder: "filo",
            access_mode: "public",
            use_filename: true,
            unique_filename: true,
        });

        user.storageUsed += req.file.size;
        await user.save();

        const { expiryHours, password } = req.body;

        let expiresAt = null;
        if(expiryHours && Number(expiryHours)> 0){
            expiresAt = new Date(Date.now() + Number(expiryHours) * 60 *60 *1000)
        }

        let hashedPassword = null;
        if(password && password.trim().length > 0){
            hashedPassword = await bcrypt.hash(password,10)
        }

        const newFile = await File.create({
            fileName:req.file.originalname,
            fileUrl:result.secure_url,
            publicId:result.public_id,
            fileSize:req.file.size,
            fileType:req.file.mimetype,
            uploadedBy:req.user.id,

                expiresAt,
                password: hashedPassword,
                downloads: 0,
        });
        return res.status(200).json({
            success:true,
            message:"file Uploaded Succesfully",
            file:newFile,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const user = await User.findById(req.user.id);

    const totalSize = req.files.reduce((sum, f) => sum + f.size, 0);

    if (user.storageUsed + totalSize > user.storageLimit) {
      return res.status(400).json({
        success: false,
        message: "Storage Full, Upgrade your plan to upload more files",
      });
    }

    const { expiryHours, password } = req.body;

    let expiresAt = null;
    if (expiryHours && Number(expiryHours) > 0) {
      expiresAt = new Date(Date.now() + Number(expiryHours) * 60 * 60 * 1000);
    }

    let hashedPassword = null;
    if (password && password.trim().length > 0) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const uploadedFiles = [];

    
    for (const f of req.files) {
      const isPdf = f.mimetype === "application/pdf";
      const result = await cloudinary.uploader.upload(f.path, {
        resource_type: isPdf ? "raw" : "auto", 
        folder: "filo",
        access_mode: "public",
        use_filename: true,
        unique_filename: true,
      });

      const savedFile = await File.create({
        fileName: f.originalname,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileSize: f.size,
        fileType: f.mimetype,
        uploadedBy: req.user.id,
        expiresAt,
        password: hashedPassword,
        downloads: 0,
      });

      uploadedFiles.push(savedFile);
    }

   
    user.storageUsed += totalSize;
    await user.save();

    
    const bundle = await Bundle.create({
      createdBy: req.user.id,
      files: uploadedFiles.map((f) => f._id),
      expiresAt,
      password: hashedPassword,
    });

    return res.status(200).json({
      success: true,
      message: "✅ Files uploaded successfully",
      bundleId: bundle._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyFiles = async(req,res)=>{
    try{
         if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized (token missing or invalid)",
            });
            }
        const files = await File.find({uploadedBy:req.user.id}).sort({createdAt:-1})

        return res.status(200).json({
            success:true,
            files,
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getPublicFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate("uploadedBy", "name email");

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Link expired",
      });
    }

    return res.status(200).json({
      success: true,
      file: {
        _id: file._id,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize,
        fileType: file.fileType,
        uploadedBy: file.uploadedBy,
        downloads: file.downloads,
        expiresAt: file.expiresAt,
        createdAt: file.createdAt,

   
        password: file.password ? true : false,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.downloadFile = async(req,res)=>{
    try{
        const file = await File.findById(req.params.id);
        const { password } = req.body;

        if(!file)
            return res.status(404).json({
                success:false,
                message:"file Not found"
            })
            if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
            return res.status(410).json({ 
                success: false, 
                message: " Link expired"
             });
            }

            if (file.password) {
                if (!password) {
                    return res.status(401).json({ 
                        success: false, 
                        message: "Password required" 
                    });
                }

                const isMatch = await bcrypt.compare(password, file.password);
                if (!isMatch) {
                    return res.status(401).json({ 
                        success: false, 
                        message: " Incorrect password" 
                    });
                }
                }


            file.downloads +=1;
            await file.save();

            return res.status(200).json({
                success:true,
                message:"download link generated",
                fileUrl:file.fileUrl,
            })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.deleteFile = async (req,res)=> {
    try{
        if (!req.user?.id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized (token missing or invalid)",
        });
        }
        const file = await File.findById(req.params.id);

        if(!file)
            return res.status(404).json({
            success:false,
            message:"File not found"
        })

        if(file.uploadedBy.toString() !== req.user.id){
            return res.status(403).json({
                success:false,
                message:"Not allowed"
            })
        }
        
        // await cloudinary.uploader.destroy(file.publicId , {resource_type:"auto"})
        await cloudinary.uploader.destroy(file.publicId, { resource_type: "raw" });
        await cloudinary.uploader.destroy(file.publicId, { resource_type: "video" });
        await cloudinary.uploader.destroy(file.publicId, { resource_type: "image" });


        const user = await User.findById(req.user.id);
        user.storageUsed = Math.max(0,user.storageUsed -  file.fileSize);
        await user.save()
        
        // db me se delete
        await File.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success:true,
            message:"File Deleted Successfully"
        })
        
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

}

exports.emailShareLink = async (req,res)=>{
    try{
        const {email,fileId}= req.body;

        if(!email || !fileId){
            return res.status(400).json({
                success:false,
                message:"Email and FileId are required"
            })
        }
        const file = await File.findById(fileId);
        if(!file){
            return res.status(404).json({
                success:false,
                message:"File Not Found"
            })
        }
        if(file.uploadedBy.toString()!== req.user.id){
            return res.status(403).json({
                success:false,
                message:"Not Allowed"
            })
        }
        const link = `${process.env.FRONTEND_URL}/file/${fileId}`;

        await sendEmail(
        email,
        "📁 File Share Link - FILO",
        `
            <h2>✅ File Shared Successfully</h2>
            <p><b>File:</b> ${file.fileName}</p>
            <p>Click below to download:</p>
            <a href="${link}" target="_blank">${link}</a>
            <p style="margin-top:10px;color:gray;font-size:12px;">
            If the file is password-protected, ask the sender for password.
            </p>
        `
        );
          return res.status(200).json({ 
            success: true,
            message: "✅ Email sent successfully!" });
    } catch (err) {
        return res.status(500).json({ 
            success: false,
            message: err.message });
    }
}







