import  express  from "express";
import cors from "cors";
import http from 'http'
import dotenv from "dotenv";
import connect from "./database/mongoose";
import messageRoute from "./routes/messageRoute";
import userRoute from "./routes/userRoute";
import { Server } from "socket.io";

dotenv.config();


const app = express();
const server = http.createServer(app);


// initialize socekt.io server
export const io = new Server(server,{
  cors:{origin: "*"}
})

// Store online users
export const userSocketMap:Record<string,string> = {}

//socket.io connection funcion
io.on("connection", (socket)=>{
  const userId = socket.handshake.query.userId

  if(typeof userId === 'string') userSocketMap[userId] = socket.id;

io.emit('getOnlineUsers', Object.keys(userSocketMap));

socket.on('disconnect', (userId)=>{
  delete userSocketMap[userId]
  io.emit('getOnlineUsers', Object.keys(userSocketMap))

})
})



app.use(cors(
  { origin:process.env.CLIENT_URL,
  credentials: true,}
));
app.use(express.json({limit: '4mb'}));
app.use('/api/auth', userRoute)
app.use('/api/messages', messageRoute)
const PORT = process.env.PORT || 8000;



server.listen(PORT, async() => {
  console.log(`Server is running on port ${PORT}`);
  await connect();
});