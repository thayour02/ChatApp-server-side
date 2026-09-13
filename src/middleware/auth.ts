import jwt from "jsonwebtoken";
import User from "../model/userModel";

import { Request, Response } from "express";



interface userToken {
    userId: string;
}

interface AuthenticatedRequest extends Request {
  user?: any;
}


export const authenticationMiddleware = async(req: AuthenticatedRequest, res: Response, next: Function) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
   const decoded = jwt.verify(token,process.env.JWT_SECRET)

     if (typeof decoded === 'string') {
      return res.status(401).json({ message: "Invalid token" });
    }

 const userId = (decoded as jwt.JwtPayload).userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    const user = await User.findById(userId).select("-password");
   if(!user){
       return res.status(401).json({message: "Unauthorized"})
   }
   req.user = user;
   next();
}