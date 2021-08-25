const clients = {}

export const pushSocketIdToArray = ({ user, id }) => {
    if (clients[user._id]) {
        clients[user._id].push(id)
    }
    else {
        clients[user._id] = [id]
    }
}

export const removeSocketIdInArray = ({ user, id }) => {
    clients[user._id] = clients[user._id].filter(sId => sId !== id)
    if (!clients[user._id].length) delete client[user._id]
    return
}

export const emitToUser = (userId, socket, eventName, data) => {
    if (client[userId]) {
        for (let i of client[userId]) {
            socket.to(i).emit(eventName, data)
        }
    }
    return
}