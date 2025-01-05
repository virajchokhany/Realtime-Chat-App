const asyncHandler = require('express-async-handler');
const tokenPayload = require('../utils/token');
const Chat = require('../Models/chatModel');
const User = require('../Models/userModel');

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
  
    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }
    var decoded = tokenPayload(req);
    var oid = decoded.oid;
    const user = await User.findOne({oid});
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
      res.send(isChat[0]);
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
        res.status(200).json(FullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  });

const fetchChats = asyncHandler(async (req,res) => {
    try{
        var decoded = tokenPayload(req);
        var oid = decoded.oid;
        const user = await User.findOne({oid});
        var chats = await Chat.find({
            users : {$elemMatch : {$eq : user._id}}
        })
        .populate("users")
        .populate("latestMessage")
        .populate("groupAdmin")
        .sort({updatedAt : -1});
        chats = await User.populate(chats,{
            path : "latestMessage.sender",
            select :"name email pic"
        })
        res.status(200).send(chats);
    }catch(error){
        res.status(400);
        throw new Error(error.message);
    }
});


const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please Fill all the feilds" });
    }
  
    var users = JSON.parse(req.body.users);
  
    if (users.length < 2) {
      return res
        .status(400)
        .send("More than 2 users are required to form a group chat");
    }
    var decoded = tokenPayload(req);
    var oid = decoded.oid;
    const user = await User.findOne({oid});
    users.push(user._id);
  
    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: user._id,
      });
  
      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users")
        .populate("groupAdmin");
  
      res.status(200).json(fullGroupChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

const renameGroupChat = asyncHandler(async (req,res) => {
    const {chatId, chatName} = req.body;
    console.log(chatId, chatName)
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          chatName: chatName,
        },
        {
          new: true,
        }
      )
        .populate("users")
        .populate("groupAdmin");
    
      if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found");
      } else {
        res.json(updatedChat);
      }
});
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
  
    // check if the requester is admin
    var isUserAdmin = await isAdmin(chatId, req,res);
    if(isUserAdmin && isUserAdmin == true){
        const removed = await Chat.findByIdAndUpdate(
            chatId,
            {
              $pull: { users: userId },
            },
            {
              new: true,
            }
          )
            .populate("users")
            .populate("groupAdmin");
        
          if (!removed) {
            res.status(404);
            throw new Error("Chat Not Found");
          } else {
            res.json(removed);
          }
    }else{
        res.status(400);
        throw new Error("You are not an Admin!!!");
    }
    
  });
  
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
  
    // check if the requester is admin
    var isUserAdmin = await isAdmin(chatId, req,res);
    if(isUserAdmin && isUserAdmin == true){
        const added = await Chat.findByIdAndUpdate(
            chatId,
            {
              $push: { users: userId },
            },
            {
              new: true,
            } 
          )
            .populate("users")
            .populate("groupAdmin");
        
          if (!added) {
            res.status(404);
            throw new Error("Chat Not Found");
          } else {
            res.json(added);
          }
    }else{
        res.status(400);
        throw new Error("You are not an Admin");
    }
    
  });

async function isAdmin(chatId, req,res){
    const token = tokenPayload(req);
    const oid = token.oid;
    const user = await User.findOne({oid});
    if(!user){
        res.status(404);
        throw new Error("User not found");
    }else{
        var chat = await Chat.findOne({_id : chatId});
        if(!chat){
            res.status(404);
            throw new Error("Chat not found");
        }else{
            if(chat.groupAdmin && chat.groupAdmin.equals(user._id)){
                return true;
            }else{
                return false;
            }
        }
    }
}
module.exports = {accessChat,fetchChats,createGroupChat,renameGroupChat,removeFromGroup,addToGroup};