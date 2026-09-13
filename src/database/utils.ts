import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';


dotenv.config()


export const generateToken = (userId:string)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET, {expiresIn: "30d"});
   return token;
}



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


export default cloudinary;