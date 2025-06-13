import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { text } from "express";
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) =>{

    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id : { $ne : loggedInUserId  } } ).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersforSidebar : ", error.message);
        res.status(500).json({error : "Internal server error"});
    }

};

export const getMessages = async(req, res)=>{
    try {
        const { id : userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({          //find all messages where sender is me and reciver is other user and vice versa
            $or : [
                { senderId : myId, receiverId: userToChatId},
                {senderId : userToChatId, receiverId : myId}
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages controller", error.message);
        res.status(500).json({error : "Internal server error"});
    }
};

export const sendMessage = async(req, res)=>{

    try {
        const {text, image} = req.body;
        const {id : receiverId} = req.params; 
        const senderId = req.user._id;

        let imageUrl;
        if(image){       // checking if user is uploading an image or not
            //upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessge = new Message ({
            senderId,
            receiverId,
            text,
            image : imageUrl
        });
        await newMessge.save();

        // real time functionality goes here -- socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessge);
        } 

        res.status(201).json(newMessge);

    } catch (error) {
        
        console.log("Error in sendMessage controller", error.message);
         res.status(500).json({error  : "Internal server error"});
    }
};