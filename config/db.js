
const mongoose = require("mongoose");

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MONGODB CONNECTED");
    }catch(error){
        console.log("MONGODB ERROr:",error.message);
        process.exit(1);
    }
}
module.exports = connectDB;