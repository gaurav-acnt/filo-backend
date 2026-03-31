
const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");

const registerSocketHandlers = (io)=>{
    io.on("connection",(socket)=>{
        console.log("socket connected",socket.id,"USer:",socket.user?.email)

        socket.on("join_room",(roomId)=>{
            socket.join(roomId);
            console.log("User joind room",roomId);
        })

        socket.on("send_message",async(data)=>{
            try{
                if(!data?.roomId || !data?.text){
                    return socket.emit("error_message","RoomId and text required");
                }
                const saved = await Message.create({
                    roomId:data.roomId,
                    sender:socket.user.id,
                    text:data.text,
                })
                await ChatRoom.findByIdAndUpdate(data.roomId, { updatedAt: new Date() });

                io.to(data.roomId).emit("receive_message",{
                    _id:saved._id,
                    roomId:saved.roomId,
                    text:saved.text,
                    sender:socket.user.id,
                    createdAt:saved.createdAt,
                })
            }catch(error){
                socket.emit("error_message",
                    "Message sending failed"
                )
            }
        });
        socket.on("disconnect",()=>{
            console.log("socket disconnected",socket.id);
        })
    })
}
module.exports = registerSocketHandlers;
