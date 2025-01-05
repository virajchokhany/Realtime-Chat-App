const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); 
const app = express();
const jwt = require('jsonwebtoken');
const Message = require("./Models/messageModel");
const User = require("./Models/userModel");
const Chat = require("./Models/chatModel");
const cors = require('cors');
const mongoose = require('mongoose');
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  }));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:4200', // Frontend origin
      methods: ['GET', 'POST']
    }
  });
 // middleware for socket io
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; 
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }
  
    try {
      const decoded =  jwt.decode(token);
  
      const { aud, iss, exp, iat, oid,name } = decoded;
      const email = decoded.preferred_username;
      if (aud !== process.env.aud || iss !== process.env.iss) {
        return next(new Error('Authentication error: Invalid audience or issuer.'));
      }
      const currentTime = Date.now() / 1000;
      if (currentTime < iat || currentTime > exp) {
        return next(new Error('Authentication error: Token is expired or not yet valid.'));
      }
      const user = await User.findOne({ oid: oid });
      if (!user) {
        user = await User.create({
            oid,
            name,
            email
        });
      }
      socket.user = user;
      next();
    } catch (err) {
      console.error('Authentication error:', err.message.red);
      return next(new Error('Authentication error: Invalid token.'));
    }
  });
  

  app.use((req, res, next) => {
    req.io = io;
    next();
  });
const colors = require('colors');
require('dotenv').config();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require("./routes/messageRoutes");
const validateJWT = require('./middleware/jwtMiddleware');
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

connectDB();
const PORT = process.env.PORT || 5000;



app.use(express.json());




app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use("/api/message", messageRoutes);

const path = require('path');
console.log(__dirname);
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'));
});
  
app.use(validateJWT);
app.use(notFound);
app.use(errorHandler);

// Socket.IO logic
io.on('connection', (socket) => {
    socket.join(socket.user._id.toString());
    console.log("user joined room ",socket.user._id.toString());
    // Handle sending messages
    
    // Handle joining rooms
    socket.on('joinRoom', (roomId) => {
      // socket.join(roomId);
    });
    socket.on('sendMessage',async (data) => {
      // save message to db
      var newMessage = {
        sender: socket.user._id,
        content: data.content,
        chat : data.chatId,
      };
      var message = await Message.create(newMessage);

      message = await message.populate("sender", "name pic email");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });
      await Chat.findByIdAndUpdate(data.chatId, { latestMessage: message });
      
      var chat = await Chat.findOne({ _id: new mongoose.Types.ObjectId(data.chatId) })
                              .populate("users")
                              .populate("latestMessage")
                              .populate("groupAdmin");
                              chat = await User.populate(chat,{
                                path : "latestMessage.sender",
                                select :"name email pic"
                            })
      // broadcast to all users of chat
      message.chat.users.forEach((user) => {  
        io.to(user._id.toString()).emit('updateChatAfterMessageSent', { 
          message, 
          chat
        });
      })
      // 
    });

    socket.on('typing', (data) => {
      const users = data.users;
      users.forEach((user) => {
        if(user._id !== socket.user._id.toString()){
          io.to(user._id).emit('typing',data._id);
        }
      })
    });

    socket.on('stopTyping', (data) => {
      const users = data.users;
      users.forEach((user) => {
        if(user._id!== socket.user._id.toString()){
          io.to(user._id).emit('stopTyping',data._id);
        }
      })
    });
    
    socket.on('newOneOnOneChatCreated', async (data) => {
      console.log(data,"newOneOnOneChatCreated");

      const userId = data.userId;
  
      if (!userId) {
        console.log("UserId param not sent with request");
        return;
      }
      const user = socket.user;
      var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: user._id } } },
          { users: { $elemMatch: { $eq: userId } } },
        ],
      })
        .populate("users")
        .populate("latestMessage");
    
      isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
    
      if (isChat.length > 0) {
        io.to(user._id.toString()).emit('chatCreated',isChat[0]);
      } else {
        var chatData = {
          chatName: "sender",
          isGroupChat: false,
          users: [user._id, userId],
        };
    
        try {
          const createdChat = await Chat.create(chatData);
          const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
            "users"
          );
          io.to(user._id.toString()).emit('chatCreated',FullChat);
        } catch (error) {
          throw new Error(error.message);
        }
      }


    });

    socket.on('newGroupChatCreated', async (data)=>{
      if (!data.users || !data.name) {
        return;
      }
    
      var users = JSON.parse(data.users);
      const user = socket.user;
      users.push(user._id.toString());
      
      try {
        const groupChat = await Chat.create({
          chatName: data.name,
          users: users,
          isGroupChat: true,
          groupAdmin: user._id,
        });
    
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
          .populate("users")
          .populate("groupAdmin");
        users.forEach((user) => {
          io.to(user).emit('chatCreated',fullGroupChat);
        })
      } catch (error) {
        throw new Error(error.message);
      }
    });
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`.yellow);
});