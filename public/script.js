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
    if(roomToJoin != '' && roomToJoin != currentRoom) {
        socket.emit('join-room-request', roomToJoin)
    }
}

// p5.js setup function
function setup() {
    createCanvas(800,600).parent(select('main'))
    background(0);
}