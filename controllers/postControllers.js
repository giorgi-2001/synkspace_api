import Post from '../models/PostModel.js'
import User from '../models/UserModel.js'
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'

export const getPosts = asyncHandler(async (req, res) => {

    const { page, author } = req.query

    const pageNumber = page || 0
    const postPerPage = 10

    try {
        const posts = await Post.find(author ? { author } : {})
            .sort({ createdAt: -1 })
            .skip(pageNumber * postPerPage)
            .limit(postPerPage)
            .populate('author', 'first_name last_name username avatar')
            .lean()

        res.status(200).json(posts)
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
})


export const createPost = asyncHandler(async (req, res) => {

    const { _id: author } = req.user

    const { body } = req.body

    const goodToGo = [body, author].every(Boolean)

    if(!goodToGo) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    try {
        const post = await Post.create({ body, author })
        res.status(200).json(post)
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
})


export const updatePost = asyncHandler(async (req, res) => {

    const { body } = req.body
    const { _id } = req.params
    const { _id: author } = req.user

    const goodToGo = [ body, _id].every(Boolean) && mongoose.isValidObjectId(_id)

    if(!goodToGo) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    try {
        const post = await Post.findOneAndUpdate({ _id, author }, { body })
        res.status(200).json(post)
    } catch (error) {
        res.status(404).json({ message: err.message })
    }
})


export const deletePost = asyncHandler(async (req, res) => {
    const { _id } = req.params
    const { _id: author } = req.user

    if(!_id || !mongoose.isValidObjectId(_id)) {
        return res.status(400).json({ message: 'Invalid object id'})
    }

    try {
        const post = await Post.findOneAndDelete({ _id, author })
        res.status(200).json(post)
    } catch (error) {
        res.status(404).json({ message: err.message })
    }
})

export const likePost = asyncHandler(async (req, res) => {
    const { _id } = req.params
    const { _id: userId } = req.user

    const user = await User.findById(userId).select('liked_posts')
    const isLiked = user.liked_posts.includes(_id)

    if(isLiked) {
        try {
            user.liked_posts = user.liked_posts.filter(postId => postId !== _id)
            await user.save()

            const post = await Post.findById(_id)
            post.likes = post.likes - 1
            await post.save()

            res.status(200).json({ message: 'Post Disliked'})
        } catch (error) {
            res.status(404).json({ message: error.message })
        }
        
    } else {
        try {
            user.liked_posts = [...user.liked_posts, _id]
            await user.save()

            const post = await Post.findById(_id)
            post.likes = post.likes + 1
            await post.save()

            res.status(200).json({ message: 'Post Liked'})
        } catch (error) {
            res.status(404).json({ message: error.message })
        }
    }
})