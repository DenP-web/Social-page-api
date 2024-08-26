const express = require('express')
const { MessagesController } = require('../controllers')
const authCheck = require('../middleware/authCheck')
const messageRouter = express.Router()


messageRouter.post('/send/:id', authCheck, MessagesController.send)
messageRouter.get('/', authCheck, MessagesController.getAllConversations)
messageRouter.get('/:id', authCheck, MessagesController.getAllMessages)
messageRouter.post('/create/:id', authCheck, MessagesController.createConversation)
messageRouter.put('/remove/:id', authCheck, MessagesController.leaveConversation)


module.exports = messageRouter