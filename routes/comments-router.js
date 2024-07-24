const {Router} = require('express')
const authCheck = require('../middleware/authCheck')
const { CommentsController } = require('../controllers')
const commentsRouter = Router()

commentsRouter.post('/', authCheck, CommentsController.create)
commentsRouter.delete('/:id', authCheck, CommentsController.delete)

module.exports = commentsRouter