import jwt from 'jsonwebtoken'
import 'dotenv/config'

const requireAuth = (req, res, next) => {
    const { authorization } = req.headers

    if(!authorization) {
        return res.status(401).json({ message: 'Anauthorized'})
    }

    try {
        const token = authorization.split(' ')[1]
        const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = { _id }
        next()
    } catch (err) {
        res.status(403).json({ message: err.message })
    }
}

export default requireAuth