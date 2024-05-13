import { Schema, model } from 'mongoose'

const commentSchema = new Schema({

    post_id: {
        type: String,
        required: true
    },

    parent_id: {
        type: String,
        default: ''
    },

    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    text: {
        type: String,
        required: true
    },

    replying_to: {
        type: String,
        default: ''
    },

    likes: {
        type: Number,
        default: 0
    }
    
}, {
    timestamps: true
})

export default model('Comment', commentSchema)