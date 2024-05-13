import { Schema, model } from 'mongoose'

const postSchema = new Schema({

    body: {
        type: String,
        required: true
    },

    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    likes: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
})

export default model('Post', postSchema)