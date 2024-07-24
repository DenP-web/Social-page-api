const {Router} = require('express')
const router = Router()


const userRouter = require('./user-router')
const postsRouter = require('./post-router')
const commentsRouter = require('./comments-router')

router.use('/user', userRouter)
router.use('/posts', postsRouter)
router.use('/comments', commentsRouter)




module.exports = router