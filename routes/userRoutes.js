import { Router } from 'express'
import requireAuth from '../middleware/requireAuth.js'
import singleUpload from '../middleware/multer.js'
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    updateAvatar
} from '../controllers/userControllers.js'

const router = Router()

router.post('/', createUser)

router.use(requireAuth)

router.route('/').get(getUsers).patch(updateUser).delete(deleteUser)

router.route('/avatar').patch(singleUpload.single("file"), updateAvatar)

export default router