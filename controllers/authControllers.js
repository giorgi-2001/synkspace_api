import User from "../models/UserModel.js"
import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import bcrypt from "bcrypt"
import "dotenv/config"

export const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    const user = await User.findOne({ username }).lean()

    if(!user) {
        res.status(401).json({ message: "Incorrect login credentials"})
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match) {
        res.status(401).json({ message: "Incorrect login credentials"})
    }

    try {
        const { password, ...data } = user

        const access_token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
        const refresh_token = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })

        res.status(200).json({ user: data, access_token, refresh_token })
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
})


export const refresh = asyncHandler(async (req, res) => {
    const { refresh_token } = req.body

    if(!refresh_token) return res.status(401).json({ message: "Anauthorized"})

    try {
        const { _id } = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(_id).select("-password").lean()
        const access_token = jwt.sign({ _id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
        res.status(200).json({ user, access_token })
    } catch (err) {
        res.status(401).json({ message: err.message})
    }
})