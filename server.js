const express = require ("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const {connectCloudinary}= require("./config/cloudinary")

const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const otpRoutes = require("./routes/otpRoutes")

const paymentRoutes = require("./routes/paymentRoutes")
const chatRoutes = require("./routes/chatRoutes")
const http = require("http")
const {Server} = require("socket.io")

const socketAuth = require("./middleware/socketAuth");
const registerSocketHandlers = require("./sockets");

const userRoutes = require("./routes/userRoutes")

const contactRoutes = require("./routes/contactRoutes");

const bundleRoutes = require("./routes/bundleRoutes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://filo-file-sharing-and-cloud-storage-nine.vercel.app/"
    ],
    methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"],
    credentials: true,
     allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

connectDB();
connectCloudinary();

app.use("/api/auth",authRoutes);
app.use("/api/files",fileRoutes);
app.use("/api/otp",otpRoutes);
app.use("/api/payment",paymentRoutes)
app.use("/api/chat", chatRoutes);
app.use("/api/user",userRoutes)
app.use("/api/contact", contactRoutes);
app.use("/api/bundle", bundleRoutes);


app.get("/",(req,res)=>{
    res.send("Filo  backend running...");
})

const server = http.createServer(app)

const io= new Server(server,{
    cors:{
        origin:[
      "http://localhost:5173",
      "https://filo-file-sharing-and-cloud-storage-nine.vercel.app/",
    ],
        methods:["GET","POST",],
        credentials: true
    }
})
io.use(socketAuth);
registerSocketHandlers(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT,()=> console.log(`Backend runnning on port ${PORT}`))



