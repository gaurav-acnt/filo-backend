const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");

exports.getOrCreateRoom = async(req,res)=>{
    try{
        const {otherUserId} = req.body;
        const myId = req.user.id;

        if(!otherUserId){
            return res.status(400).json({
                success:false,
                message: "other user id is required"
            })
        }

        let room = await ChatRoom.findOne({
            members:{$all:[myId,otherUserId]}
        })
        if(!room){
            room = await ChatRoom.create({members:[myId,otherUserId]})
        }
        return res.status(200).json({
            success:true,
            room
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getMessages = async(req,res)=>{
    try{
        const {roomId}= req.params;

        const messages = await Message.find({roomId})
        .populate("sender","name email")
        .sort({createdAt:1});

        return res.status(200).json({
            success:true,
            messages
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getMyRooms = async (req, res) => {
  try {
    const myId = req.user.id;

    const rooms = await ChatRoom.find({
      members: myId,
    })
      .populate("members", "name email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ 
        success: true,
        rooms 
        });
  } catch (err) {
    return res.status(500).json({
        success: false,
        message: err.message
         });
  }
};
