import User from '../models/user.model.js';
import Message from "../models/message.model.js";
export const getUsersForSidebar = async (req, res)=>{
    try{
    const loggedInUser = req.user._id
    const filteredUsers = await User.find({_id: {$ne: loggedInUser}}).select('-password')
    res.status(200).json({users: filteredUsers})

    }catch(error){
        console.log('Error in getUsersSidebar controller: ', error.message)
        return res.status(500).json({message: 'Internal server error'});
    }
}

export const getMessages = async(req, res)=>{
    try{
        const currentUser = req.user._id
        const otherUser = req.params.id
        const messages = await Message.find({
            $or: [
                {receiverId: currentUser, senderId: otherUser},
                {senderId: otherUser, receiverId: currentUser}
            ]
        })
        // .populate('from', 'name')
        // .populate('to', 'name')
        // .sort('-createdAt')
        res.status(200).json({messages})
    }catch(error){
        console.log('Error in getMessages controller: ', error.message)
        return res.status(500).json({message: 'Internal server error'});
    }
}

export const sendMessage = async(req, res)=>{
    try{
        const senderId = req.user._id
        const receiverId = req.params.id
        const {message, image} = req.body
        let imageUrl;
        if(image){
            const imageResponse =  await cloudinary.uploader.upload(image);
            imageUrl = imageResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            message,
            image: imageUrl
        })
        await newMessage.save()
        res.status(200).json(newMessage)
    }catch(error){
        console.log('Error in sendMessage controller: ', error.message)
        return res.status(500).json({message: 'Internal server error'});
    }
}