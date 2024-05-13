import { Router } from 'express'

import {
    getPosts,
    createPost,
    updatePost,
    deletePost,
    likePost
} from '../controllers/postControllers.js'

const router = Router()

router.route('/').get(getPosts).post(createPost)

router.route('/:_id').patch(updatePost).delete(deletePost)

router.patch('/like/:_id', likePost)

export default router