console.log("PaintOnline starting...\n")

const express = require('express')
const res = require('express/lib/response')
const app = express()
const server = app.listen(3000)

app.use(express.static('public'))

const socket = require('socket.io')
const io = socket(server)


let clientsNicknames = {}
clientsNicknames.log = () => console.log(`Clients-nicknames dict: ${JSON.stringify(clientsNicknames)}`)

io.sockets.on('connection', (socket) => {

    const newID = generateRoomID(4)
    console.log(`New connection with ID: ${socket.id}; Assigning room ID: ${newID}`)
    socket.emit('new-room-id', {id:newID})

    socket.join(newID)

    socket.room = newID

    clientsNicknames[socket.id] = 'Joe Generic'

    clientsNicknames.log()

    socket.on('changed-nickname', (data) => {
        clientsNicknames[socket.id] = data.newNickname
        console.log(`Socket ${socket.id} now has nickname: ${data.newNickname}`)
        clientsNicknames.log()
    })

    socket.on('join-room-request', (data) => {
        const roomToJoinExists = socket.adapter.rooms.has(data.roomToJoin)
        if(roomToJoinExists) {
            console.log(`Client ${socket.id} wants to join an EXISTING room ${data.roomToJoin}`) 

            socket.leave(socket.room)
            socket.room = data.roomToJoin
            socket.join(socket.room)

            const nicknamesInRoom = Array.from(socket.adapter.rooms.get(data.roomToJoin).values())
                                      .map(x => clientsNicknames[x])

            socket.emit('join-room-greenlight', {roomToJoin:data.roomToJoin, nicknamesInRoom})
        }
        else {
            console.log(`Client ${socket.id} wants to join an NON-EXISTING room ${data.roomToJoin}`)
            socket.emit('join-room-error', {})
        }
    })

    socket.on('disconnect', (data) => {
        console.log(`${socket.id} a.k.a. ${clientsNicknames[socket.id]} disconnected`)

        // for (const [room, clients] of Object.entries(roomsClients)) {
        //     clients.delete(socket.id)
        //     if(clients.size == 0) {
        //         roomsClients[room].delete()
        //     }
        // }
    })

})

const generateRoomID = (length, taken) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let result = ""

    for(let i = 0; i < length; i++) {
        result += characters[Math.floor(Math.random()*characters.length)]
    }
    return result
}