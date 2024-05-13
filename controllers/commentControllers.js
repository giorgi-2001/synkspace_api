import Comment from '../models/CommentModel.js'
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import User from '../models/UserModel.js'

export const getComments = asyncHandler(async (req, res) => {

    const { postId: post_id } = req.query

    try {
        const comments = await Comment.find({ post_id })
            .sort({ createdAt: -1 })
            .populate('author', 'first_name last_name username avatar')
            .lean()

        res.status(200).json(comments)
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
})


export const createComment = asyncHandler(async (req, res) => {

    const { _id: author } = req.user

    const {
        post_id,
        parent_id,
        text,
        replying_to
    } = req.body

    const goodToGo = [post_id, text, author].every(Boolean)

    if(!goodToGo) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    try {
        const comment = await Comment.create({ 
            post_id,
            parent_id,
            author,
            text,
            replying_to 
        })
        res.status(200).json(comment)
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
})


export const updateComment = asyncHandler(async (req, res) => {

    const { text } = req.body
    const { _id } = req.params

    const goodToGo = [text, _id].every(Boolean) && mongoose.isValidObjectId(_id)

    if(!goodToGo) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    try {
        const comment = await Comment.findByIdAndUpdate(_id, { text })
        res.status(200).json(comment)
    } catch (error) {
        res.status(404).json({ message: err.message })
    }
})


export const deleteComment = asyncHandler(async (req, res) => {
    const { _id } = req.params

    if(!_id || !mongoose.isValidObjectId(_id)) {
        return res.status(400).json({ message: 'Invalid object id'})
    }

    try {
        const comment = await Comment.findByIdAndDelete(_id)
        res.status(200).json(comment)
    } catch (error) {
        res.status(404).json({ message: err.message })
    }
})


export const likeComment = asyncHandler(async (req, res) => {
    const { _id: commentId } = req.params
    const { _id: userId } = req.user

    const user = await User.findById(userId).select('liked_comments')
    const isLiked = user.liked_comments.includes(commentId)

    if(isLiked) {
        try {
            user.liked_comments = user.liked_comments.filter(comId => comId !== commentId)
            await user.save()

            const comment = await Comment.findById(commentId)
            comment.likes = comment.likes -1
            await comment.save()

            res.status(200).json({ message: 'Comment disliked'})
        } catch (error) {
            res.status(404).json({ message: err.message })
        }
    } else {
        try {
            user.liked_comments = [...user.liked_comments, commentId]
            await user.save()

            const comment = await Comment.findById(commentId)
            comment.likes = comment.likes +1
            await comment.save()

            res.status(200).json({ message: 'Comment liked'})
        } catch (error) {
            res.status(404).json({ message: err.message })
        }
    }
})