import { Schema, model } from 'mongoose'

const userSchema = new Schema({

    first_name: {
        type: String,
        required: true,
    },

    last_name: {
        type: String,
        required: true,
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    avatar: {
        type: String,
        default: 'avatars/incognito'
    },

    liked_posts: [
        {
            type: String
        }
    ],

    liked_comments: [
        {
            type: String
        }
    ],
})

export default model('User', userSchema)