const jwt = require('jsonwebtoken')

const { User } = require('../../configs/database')

exports.socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token
        if (!token) return next(new Error('Bạn cần đăng nhập để thực hiện hành động này!'))
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findByPk(decode.id)

        if (!user) {
            return next(new Error('Bạn cần đăng nhập để thực hiện hành động này!'))
        }
        socket.user = user
        next()
    } catch (err) {
        next(new Error('Bạn cần đăng nhập để thực hiện hành động này!'))
    }
}