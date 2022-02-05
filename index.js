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

    const newID = generateRoomID(4, Array.from(socket.adapter.rooms.keys()))
    const newNickname = generateNewNickname()

    console.log(`New socket ID: ${socket.id}; Room ID: ${newID}; Nickname: ${newNickname}`)

    clientsNicknames[socket.id] = 'Joe Generic'
    socket.room = newID
    socket.join(socket.room)

    socket.emit('init', {id:newID, nickname:newNickname})




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
    })

})

const generateRoomID = (length, taken) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    do {
        var result = ""

        for(let i = 0; i < length; i++) {
            result += characters[Math.floor(Math.random()*characters.length)]
        }

    } while(taken.includes(result))
    
    
    return result
}

const generateNewNickname = () => {
    const adjectives = ['Big', 'Small']
    const nouns = ['Alice', 'Bob']

    return adjectives[Math.floor(Math.random()*adjectives.length)]
           + " " + nouns[Math.floor(Math.random()*nouns.length)]
}