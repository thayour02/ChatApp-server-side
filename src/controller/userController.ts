import User from "../model/userModel";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { generateToken } from "../database/utils";
import cloudinary  from '../database/utils';




// Define the interface for the user token
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const Register = async(req:Request, res:Response) => {
    const { email, password, fullName, profilePicture, bio } = req.body;
    try {
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:'User with this email already exists'})
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const newUser = await User.create({
            email,
            password: hashedPassword,
            fullName,
            profilePicture,
            bio
        });
        const token = generateToken(newUser._id.toString())
     res.status(201).json({ 
        success:true,
        message: "User created successfully",
        user: newUser,
        token
      });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message:`Internal server error: ${error.message}`
        })
    }
}


export const Login = async(req:Request, res:Response)=>{
const {email,password} = req.body;
try {
    const user = await User.findOne({email})
    const isPasswordValid  = await bcrypt.compare(password, user?.password )
    if(!user || !isPasswordValid){
        return res.status(400).json({message: "Invalid details"})
    }
    const token = generateToken(user._id.toString())
    res.status(200).json({
        success: true,
        message: "Login successful",
        user,
        token
    })
} catch (error) {
    console.log(error.message)
    res.status(500).json({
        success: false,
        message: `Internal server error: ${error.message}`
    })
}
}

export const checkAuth = async(req:AuthenticatedRequest, res:Response)=>{
    res.json({success:true, user:req.user})
}


export const UpdateProfile = async(req:AuthenticatedRequest, res:Response)=>{
    const { fullName, profilePicture, bio } = req.body;
    const userId = req.user._id;

try {
   const upload = await cloudinary.uploader.upload(profilePicture, {
       folder: "profile_pictures",
   });

   const updateUser = await User.findByIdAndUpdate(userId,{
         fullName,
         profilePicture: upload.secure_url,
         bio
    }, {new: true});
   if (!updateUser) {
       return res.status(404).json({
           success: false,
           message: "User not found"
       });
   }
   res.status(200).json({
       success: true,
       message: "Profile updated successfully",
       user: updateUser
   });
} catch (error) {
    res.status(500).json({
        success:false,
        message:`error update your profile ${error.message}`
    })
}
}

export const delteUser = async(req:AuthenticatedRequest, res:Response)=>{
    try{
        const userId = req.user._id

        if(!userId){
        return res.status(400).json({message: "User not found"})
        }

        const delteuser = await User.findByIdAndDelete(userId)
        res.status(200).json({
            success:true,
            message:"account deleted successfully",
            delteUser
        })
    }catch(error){
         res.status(500).json({
        success:false,
        message:`error update your profile ${error.message}`
    })
    }
}