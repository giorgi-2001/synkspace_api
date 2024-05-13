import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import authRoutes from './routes/authRoutes.js'
import corsOptions from './config/corsOptions.js'
import requireAuth from './middleware/requireAuth.js'

const PORT = process.env.PORT || 3500

const app = express()

app.use(cors(corsOptions))

app.use(express.json())

app.use((req, res, next) => {
    console.log(req.method, req.path)
    next()
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/posts', requireAuth, postRoutes)
app.use('/api/v1/comments', requireAuth, commentRoutes)



app.use('*', express.static('public'))

mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(PORT, console.log(
        `Server started on port - ${PORT}\nConnected to MongoDB`
    ))
})

