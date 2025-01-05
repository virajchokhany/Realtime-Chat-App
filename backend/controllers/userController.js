const asyncHandler = require('express-async-handler');
const tokenPayload = require('../utils/token');
const User = require('../Models/userModel');

const createNewUser = asyncHandler(async (req,res) => {
    const {displayName, pic} = req.body;
    const token = tokenPayload(req);
    const oid = token.oid;
    const name = token.name;
    const email = token.preferred_username;
    const userExists = await User.findOne({oid});
    if(!userExists){
        const newUser = await User.create({
            oid,
            name,
            email
        });
        if(newUser){
            res.status(201).json({
                _id : newUser._id,
                name : newUser.name,
                email : newUser.email,
                oid : newUser.oid
            });
        }else{
            res.status(400);
            throw new Error("Failed to create new user");
        }
    }else{
        res.status(200).send('User already added');
    }
});

const getUserProfile = asyncHandler(async (req,res) =>{
    const token = tokenPayload(req);
    const oid = token.oid;
    const user = await User.findOne({oid : oid});
    if(user===undefined || user===null){
        res.status(404).send('User does not exist');
    }else{
        res.status(200).json({
            pic : user.pic,
            _id : user._id,
            name : user.name
        });
    }
}); 

const allUsers = asyncHandler(async (req,res) => {
    const token = tokenPayload(req);
    const oid = token.oid;
    const search = req.query.search;

    const users = await User.find({
        oid : {$ne : oid},
        $or : [
            {
                name : {$regex : search,$options:"i"}
            },
            {
                email : {$regex : search,$options:"i"}
            }
        ]
    });
    res.send(users);
})
module.exports = {createNewUser ,getUserProfile, allUsers};