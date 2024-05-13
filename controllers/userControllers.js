import User from '../models/UserModel.js'
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import validator from 'validator'
import cld from '../config/cloudinary.js'

export const getUsers = asyncHandler(async (req, res) => {

    const { keyword } = req.query

    try {
        const users = await User.find({
            $or: [
                { username: { $regex: keyword, $options: 'i' } },
                { first_name: { $regex: keyword, $options: 'i' } },
                { last_name: { $regex: keyword, $options: 'i' } },
            ]
        }).lean()

        res.status(200).json(users)
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
})


export const createUser = asyncHandler(async (req, res) => {

    const {
        first_name,
        last_name,
        username,
        password
    } = req.body

    const goodToGo = [first_name, last_name, username, password].every(Boolean)

    if (!goodToGo) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const exists = await User.findOne({ username })

    if (exists) {
        return res.status(409).json({ message: 'Username already in use' })
    }

    if (!validator.isStrongPassword(password)) {
        return res.status(400).json({ message: 'Password is not strong enough' })
    }

    try {
        const hash = await bcrypt.hash(password, 10)
        const user = await User.create({
            first_name,
            last_name,
            username,
            password: hash
        })
        res.status(200).json({ message: `User - ${user.username} successfully created` })
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
})


export const updateUser = asyncHandler(async (req, res) => {

    const { _id } = req.user

    const {
        first_name,
        last_name,
        username,
        password,
        newPassword
    } = req.body

    const goodToGo = [first_name, last_name, username].every(Boolean)

    if (!goodToGo) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const exists = await User.findOne({
        username, _id: {
            $not: { $eq: _id }
        }
    })

    if (exists) {
        return res.status(409).json({ message: 'Username already in use' })
    }

    if (password && newPassword) {

        const user = await User.findById(_id)

        const match = await bcrypt.compare(password, user.password)

        if (!match) {
            return res.status(401).json({ message: 'Password is not correct' })
        }

        if (!validator.isStrongPassword(newPassword)) {
            return res.status(400).json({ message: 'Password is not strong enough' })
        }

        try {
            const hash = await bcrypt.hash(newPassword, 10)
            await user.updateOne({
                first_name,
                last_name,
                username,
                password: hash
            })
            res.status(200).json({ message: `User - ${user.username} successfully updated` })
        } catch (err) {
            res.status(404).json({ message: err.message })
        }

    } else {

        try {
            const user = await User.findByIdAndUpdate(_id, {
                first_name,
                last_name,
                username,
            })
            res.status(200).json({ message: `User - ${user.username} successfully updated` })
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }
})


export const deleteUser = asyncHandler(async (req, res) => {

    const { _id } = req.user

    if (!_id || !mongoose.isValidObjectId(_id)) {
        return res.status(400).json({ message: 'Invalid object id' })
    }

    try {
        const user = await User.findByIdAndDelete(_id)
        res.status(200).json({ message: `User - ${user.username} successfully deleted` })
    } catch (error) {
        res.status(404).json({ message: err.message })
    }
})

export const updateAvatar = asyncHandler(async (req, res) => {
    const file = req.file
    const { _id } = req.user

    try {
        const result = await new Promise((resolve) => {
            cld.uploader.upload_stream({
                'folder': 'avatars'
            }, (error, uploadResult) => {
                return resolve(uploadResult);
            }).end(file.buffer)
        })

        const user = await User.findById(_id)
        user.avatar = result.public_id
        await user.save()
        res.status(200).json({ avatar: result.public_id })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

    console.log(publicId)
})