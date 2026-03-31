const jwt = require("jsonwebtoken")

const socketAuth = (socket,next) =>{
    try{
        const token = socket.handshake.auth?.token;
        if (!token) 
        return next(new Error("Token missing"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded; 
    next();
    }catch (error) {
    next(new Error("Invalid token"));
  }
}
module.exports = socketAuth;

