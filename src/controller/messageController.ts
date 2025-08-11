import express from "express";
import Message from "../model/message";
import User from "../model/userModel";
import { Request, Response } from "express";
import { io, userSocketMap } from "../app";
import cloudinary from "../database/utils";

// Define the interface for the user token
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getUserForSideBar = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user._id;

    const filteredUser = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    //count the number of message
    const unseenMessage: Record<string, number> = {};
    const promises = filteredUser.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessage[user._id.toString()] = messages.length;
      }
    });
    await Promise.all(promises);

    res.status(200).json({
      success: true,
      users: filteredUser,
      unseenMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

//get all messages for selected User by id

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { selectedUserId } = req.params;
    const myId = req.user._id;


    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );
    res.status(200).json({ success: true, message: messages });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

//to mark message as seen by id
export const markMessageAsSeen = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// Send messgae to selected User
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, image } = req.body;

    const receiverId = req.params.id;

    const senderId = req.user._id;


    let imageUrl;

    if (image) {
      const uploadImage = await cloudinary.uploader.upload(image);
      imageUrl = uploadImage.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    //emit new message to receiver socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(200).json({ success: true, newMessage });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const deleteMessage = async(req:Request, res:Response)=>{

   const { msgId } = req.params;

    // Check if message exists before deleting
    const message = await Message.findById(msgId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Delete the message
    await Message.findByIdAndDelete(msgId);

    // Find recipient's socket ID (assuming you store by user ID)
    const recipientSocketId = userSocketMap[message.receiverId.toString()];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("deletedMessage", { msgId });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      msgId
    });

}

// export const editMessage = async(req:Request, res:Response)=>{
//   try {
//     const id = req.params.id
//     const 
//   } catch (error) {
    
//   }
// }