import mongoose from "mongoose";

interface User{
    email: string;
    password: string;
    fullName: string;
    profilePicture: string;
    bio: string;
    timeStamp:Date;
    
}

const userSchema = new mongoose.Schema<User>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: 'available'
    },
    timeStamp: {
        type: Date,
        default: Date.now
    }
},{timestamps: true});

const User = mongoose.model<User>('User', userSchema)

export default User;