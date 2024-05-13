import { Router } from 'express'
import {
    getComments,
    createComment,
    updateComment,
    deleteComment, 
    likeComment
} from '../controllers/commentControllers.js'

const router = Router()

router.route('/').get(getComments).post(createComment)

router.route('/:_id').patch(updateComment).delete(deleteComment)

router.patch('/like/:_id', likeComment)

export default router