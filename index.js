console.log("PaintOnline starting...\n")

const express = require('express')
const res = require('express/lib/response')
const app = express()
const server = app.listen(3000)

app.use(express.static('public'))

const socket = require('socket.io')
const io = socket(server)


let clientsNicknames = {}


io.sockets.on('connection', (socket) => {

    const newID = generateRoomID(4)
    console.log(`New connection with ID: ${socket.id}; Assigning room ID: ${newID}`)
    socket.emit('new-room-id', {id:newID})

    clientsNicknames[socket.id] = 'Joe Generic'

    socket.on('changed-nickname', (data) => {
        clientsNicknames[socket.id] = data.newNickname
        console.log(`Socket ${socket.id} now has nickname: ${data.newNickname}`)
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