console.log("PaintOnline starting...\n")

// set up express to host files in 'public' directory on port 3000
const express = require('express')
const app = express()
const server = app.listen(3000)
app.use(express.static('public'))

// set up socket.io on the same port as server
const socket = require('socket.io')
const io = socket(server)

// send a message with current user count every 5s
let userCount = 0
setInterval(() => {io.emit('update-user-count', userCount)}, 5000)

// dictionary to relate socket IDs with users' nicknames
let clientsNicknames = {}
clientsNicknames.log = () => console.log(`Clients-nicknames dict: ${JSON.stringify(clientsNicknames)}`)

// when recieving a new socket connection...
io.sockets.on('connection', (socket) => {

    // increment current user count
    userCount++

    // generate new room ID and nickname for the new socket
    const newID = generateRoomID(1, Array.from(socket.adapter.rooms.keys()))
    const newNickname = generateNewNickname()
    console.log(`New socket ID: ${socket.id}; Room ID: ${newID}; Nickname: ${newNickname}`)

    // assign the nickname to the socket's ID
    clientsNicknames[socket.id] = newNickname

    // save the socket's new room ID and have it join a room of that ID
    socket.room = newID
    socket.join(socket.room)

    // emit a message to the new socket with all initial info
    socket.emit('init', {id:newID, nickname:newNickname, userCount})

    // handle user changing their nickname
    socket.on('changed-nickname', (newNickname) => {
        // update the entry in the dictionary
        clientsNicknames[socket.id] = newNickname
        console.log(`Socket ${socket.id} now has nickname: ${newNickname}`)
        
        // inform all users in the same room of the change
        emitUpdateNicknamesList(socket.room)
    })

    // handle user wantin to join a room
    socket.on('join-room-request', (roomToJoin) => {

        // establish if the room exists
        const roomToJoinExists = socket.adapter.rooms.has(roomToJoin)

        if(roomToJoinExists) {
            console.log(`Client ${socket.id} wants to join an EXISTING room ${roomToJoin}`) 

            // leave the old room, save the new room ID and join the room
            socket.leave(socket.room)
            socket.room = roomToJoin
            socket.join(socket.room)

            // allow the socket to join room, update all user lists in the room
            socket.emit('join-room-greenlight', roomToJoin)
            emitUpdateNicknamesList(socket.room)
        }
        else {
            console.log(`Client ${socket.id} wants to join an NON-EXISTING room ${roomToJoin}`)
            socket.emit('join-room-error', roomToJoin)
        }
    })


    socket.on('drawing-data', (data) => {
        socket.to(socket.room).emit('drawing-data', data)
    })

    socket.on('erase-board', () => {
        socket.to(socket.room).emit('erase-board')
    })


    // handle user disconnecing
    socket.on('disconnect', (data) => {
        // decrement user count
        userCount--
        
        // remove the entry from the dictionary
        delete clientsNicknames[socket.id]

        // update all user lists in the room
        emitUpdateNicknamesList(socket.room)

        console.log(`${socket.id} a.k.a. ${clientsNicknames[socket.id]} disconnected`)
    })

}) // end of socket.on('connection')


// emits all users' nicknames to all sockets in a given room
const emitUpdateNicknamesList = (roomID) => {

    const room = io.sockets.adapter.rooms.get(roomID)

    // only continue if room exists (not all users have disconnected)
    if (room) { 
        const nicknames = Array.from(room.values()).map(x => clientsNicknames[x])
        io.to(roomID).emit('update-nicknames-list', nicknames)
    }
}


// returns a string of [length] random capital letters
// that doesn't appear in the [taken] Set
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


// generate random nickname of format "{adjective} {noun}"
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