const socket = io("http://localhost:3000")


// initial data from server: new room ID, nickname and current user count
socket.on('init', (data) => {
    document.getElementById('room-id').innerText = data.id
    document.getElementById('nickname').innerText = data.nickname
    updateUserCount(data.userCount)
    updateNicknamesList([data.nickname])
})


// handle joining the room as requested
socket.on('join-room-greenlight', (roomID) => {
    document.getElementById('room-id').innerText = roomID
    document.getElementById('join-room-input').classList.remove('error')
})


// handle trying to join a non-existing room
socket.on('join-room-error', () => {
    document.getElementById('join-room-input').classList.add('error')
})


// call updateNicknamesList()
socket.on('update-nicknames-list', (users) => {
    updateNicknamesList(users)
})


// call updateUserCount()
socket.on('update-user-count', (count) => {
    updateUserCount(count)
})


// updates the list of users in room
const updateNicknamesList = (nicknames) => {
    const list = document.getElementById('users-list')
    
    // clear the list
    list.innerHTML = ''

    // add all nicknames as <li> elements
    for(let nickname of nicknames) {
        let li = document.createElement('li')
        let text = document.createTextNode(nickname)
        li.appendChild(text)
        list.appendChild(li)
    }
}


// updates the current user count
const updateUserCount = (count) => {
    document.getElementById('user-count').innerText = count
}


// change nickname and inform the server of it
document.getElementById('nickname-btn').onclick = () => {
    const newNickname = document.getElementById('nickname-input').value
    const currentNickname = document.getElementById('nickname').innerText

    // ignore if input field is empty or the same as current nickname
    if(newNickname != '' && newNickname != currentNickname) {
        document.getElementById('nickname').innerText = newNickname
        socket.emit('changed-nickname', newNickname)
    }
}


// ask the server to join room of ID specified in the input field
document.getElementById('join-room-btn').onclick = () => {
    const roomToJoin = document.getElementById('join-room-input').value.toUpperCase()
    const currentRoom = document.getElementById('room-id').innerText

    // ignore if input field is empty or the same as current nickname
    if(roomToJoin != '') {
        if(roomToJoin == currentRoom) {
            // clear red error from input if entered the same room ID as currently in
            document.getElementById('join-room-input').classList.remove('error')
        } else {
            socket.emit('join-room-request', roomToJoin)
        }
    }
}


document.getElementById('erase-board-btn').onclick = () => {
    socket.emit('erase-board')
    linesToDraw = []
}

socket.on('drawing-data', (data) => {
    linesToDraw = [...new Set([...linesToDraw,...data.linesToAdd])] // union of 2 arrays
})

socket.on('erase-board', () => {
    linesToDraw = []
})


// p5.js setup function
function setup() {
    createCanvas(800,600).parent(select('main'))
    background(255)
    
    setInterval(() => {
        if(linesToAdd.length > 0 || linesToRemove.length > 0) {
            socket.emit('drawing-data', {linesToAdd, linesToRemove})
            linesToAdd = []
            linesToRemove = []
        }
    }, 50);
}

function draw() {
    background(255)

    strokeWeight(4)
    stroke(0)
    
    point(mouseX, mouseY)
    for(let l of linesToDraw) {
        line(l.x1, l.y1, l.x2, l.y2)
    }
}

let lastMousePos = {x: -1, y: -1}

let linesToAdd = []
let linesToRemove = []
let linesToDraw = []

function mousePressed() {
    strokeWeight(4)
    stroke(0)
    point(mouseX, mouseY)
    lastMousePos = {x: mouseX, y: mouseY}

    linesToAdd.push({x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY})
}

function mouseDragged() {
    linesToDraw.push({x1: mouseX, y1: mouseY, x2: lastMousePos.x, y2: lastMousePos.y})
    linesToAdd.push({x1: lastMousePos.x, y1: lastMousePos.y, x2: mouseX, y2: mouseY})
    lastMousePos = {x: mouseX, y: mouseY}
}