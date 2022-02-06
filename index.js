console.log("PaintOnline starting...\n")

const express = require('express')
const res = require('express/lib/response')
const app = express()
const server = app.listen(3000)

app.use(express.static('public'))

const socket = require('socket.io')
const io = socket(server)

setInterval(() => {io.emit('update-user-count', userCount)}, 5000)

let userCount = 0

let clientsNicknames = {}
clientsNicknames.log = () => console.log(`Clients-nicknames dict: ${JSON.stringify(clientsNicknames)}`)

io.sockets.on('connection', (socket) => {

    userCount++

    const newID = generateRoomID(4, Array.from(socket.adapter.rooms.keys()))
    const newNickname = generateNewNickname()

    console.log(`New socket ID: ${socket.id}; Room ID: ${newID}; Nickname: ${newNickname}`)

    clientsNicknames[socket.id] = newNickname
    socket.room = newID
    socket.join(socket.room)

    socket.emit('init', {id:newID, nickname:newNickname, userCount})

    socket.on('changed-nickname', (newNickname) => {
        clientsNicknames[socket.id] = newNickname
        console.log(`Socket ${socket.id} now has nickname: ${newNickname}`)
        clientsNicknames.log()
        emitUpdateNicknamesList(socket.room)
    })

    socket.on('join-room-request', (roomToJoin) => {
        const roomToJoinExists = socket.adapter.rooms.has(roomToJoin)
        if(roomToJoinExists) {
            console.log(`Client ${socket.id} wants to join an EXISTING room ${roomToJoin}`) 

            socket.leave(socket.room)
            socket.room = roomToJoin
            socket.join(socket.room)

            const nicknamesInRoom = getNicknamesInRoom(roomToJoin)

            socket.emit('join-room-greenlight', {roomToJoin, nicknamesInRoom})
            emitUpdateNicknamesList(socket.room)
        }
        else {
            console.log(`Client ${socket.id} wants to join an NON-EXISTING room ${roomToJoin}`)
            socket.emit('join-room-error')
        }
    })

    socket.on('disconnect', (data) => {
        userCount--
        delete clientsNicknames[socket.id]
        emitUpdateNicknamesList(socket.room)
        console.log(`${socket.id} a.k.a. ${clientsNicknames[socket.id]} disconnected`)
    })

})

const emitUpdateNicknamesList = (roomID) => {
    io.to(roomID).emit('update-nicknames-list', getNicknamesInRoom(roomID))
}

const getNicknamesInRoom = (roomID) => {
    const room = io.sockets.adapter.rooms.get(roomID)
    if (room)
        return Array.from(room.values()).map(x => clientsNicknames[x])
}

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

    // arrays from https://stackoverflow.com/questions/7666516/fancy-name-generator-in-node-js/7668656

    const adjectives = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
    "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
    "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
    "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
    "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
    "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
    "wandering", "withered", "wild", "black", "young", "holy", "solitary",
    "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
    "polished", "ancient", "purple", "lively", "nameless"]

    const nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
    "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
    "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
    "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
    "firefly", "feather", "grass", "haze", "mountain", "night", "pond",
    "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
    "thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
    "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
    "frog", "smoke", "star"]

    return adjectives[Math.floor(Math.random()*adjectives.length)]
           + " " + nouns[Math.floor(Math.random()*nouns.length)]
}