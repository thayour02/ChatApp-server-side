import express from 'express'

import { authenticationMiddleware } from '../middleware/auth'
import { getMessages,markMessageAsSeen,getUserForSideBar,sendMessage, deleteMessage } from '../controller/messageController'

const router = express.Router()
    router.get('/users',authenticationMiddleware, getUserForSideBar)
    router.get('/get-messages/:selectedUserId',authenticationMiddleware, getMessages)
    router.post('/send/:id', authenticationMiddleware, sendMessage)
    router.put('/mark-message/:id',authenticationMiddleware, markMessageAsSeen)
    router.delete('/delete/:msgId', authenticationMiddleware,deleteMessage)


    export default router;