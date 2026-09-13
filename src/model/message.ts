import mongoose from "mongoose";

interface Message{
    senderId: mongoose.Schema.Types.ObjectId;
    receiverId: mongoose.Schema.Types.ObjectId;
   text: string;
   image: string;
   seen: Boolean;
}

const userSchema = new mongoose.Schema<Message>({
    senderId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref:'User',
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    text: {
        type: String,
        // required: true
    },
    image: {
        type: String,
        default: ''
    },
    seen: {
        type: Boolean,
        default: false
    }
   
},{timestamps: true});

const Message = mongoose.model<Message>('Message', userSchema)

export default Message;