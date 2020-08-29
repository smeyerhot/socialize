import express from 'express'
import authCtrl from '../controllers/auth.controller'
import userCtrl from '../controllers/user.controller'

//Todo create the listOpen() method.
const router = express.Router()

router.route('/api/chats')
    .get(chatCtrl.listOpen)
router.route('/api/chat/:chatId')


router.route('/api/messages/:userId')
    .get(authCtrl.requireSignin)

router.param('userId', userCtrl.userByID)




export default router
