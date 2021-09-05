const clients = {}

exports.pushSocketIdToArray = ({ user, id }) => {
    if (clients[user._id]) {
        clients[user._id].push(id)
    }
    else {
        clients[user._id] = [id]
    }
}

exports.removeSocketIdInArray = ({ user, id }) => {
    clients[user._id] = clients[user._id].filter(sId => sId !== id)
    if (!clients[user._id].length) delete clients[user._id]
    return
}

exports.emitToUser = (userId, io, eventName, data) => {
    console.log(userId)
    if (clients[userId]) {
        for (let i of clients[userId]) {
            io.to(i).emit(eventName, data)
        }
    }
    return
}