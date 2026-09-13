import  express, { Router }  from "express";

import { Register,Login,UpdateProfile, checkAuth, delteUser } from "../controller/userController";
import { authenticationMiddleware } from "../middleware/auth";




const router = express.Router()
router.post('/register', Register)
  router.post('/login', Login)
    router.put('/update-profile',authenticationMiddleware, UpdateProfile)
    router.get('/check',authenticationMiddleware, checkAuth)
    router.delete('/delete/:userId', authenticationMiddleware, delteUser)

export default router