const socket = io("http://localhost:3000")

// upon recieving the ID of a new room
// when connecting for the first time,
// show the new ID
socket.on('init', (data) => {
    document.getElementById('room-id').innerText = data.id
    document.getElementById('nickname').innerText = data.nickname
    updateUserCount(data.userCount)
    updateNicknamesList([data.nickname])
})

socket.on('join-room-greenlight', (data) => {
    document.getElementById('room-id').innerText = data.roomToJoin
    console.log(data.nicknamesInRoom)
    updateNicknamesList(data.nicknamesInRoom)
})

socket.on('update-users-list', (users) => {
    console.log('updating users list...')
    updateNicknamesList(users)
})

socket.on('update-user-count', (count) => {
    updateUserCount(count)
})

const updateUserCount = (count) => {
    document.getElementById('user-count').innerText = count
}

const updateNicknamesList = (clients) => {
    const list = document.getElementById('users-list')
    list.innerHTML = ''
    for(let client of clients) {
        let li = document.createElement('li')
        let text = document.createTextNode(client)
        li.appendChild(text)
        list.appendChild(li)
    }
}

// when new nickname button is pressed
// change the displayed nickname and
// emit the change to the server
document.getElementById('nickname-btn').onclick = () => {
    const newNickname = document.getElementById('nickname-input').value
    const currentNickname = document.getElementById('nickname').innerText
    if(newNickname != '' && newNickname != currentNickname) {
        document.getElementById('nickname').innerText = newNickname
        socket.emit('changed-nickname', newNickname)
    }
}

document.getElementById('join-room-btn').onclick = () => {
    const roomToJoin = document.getElementById('join-room-input').value.toUpperCase()
    const currentRoom = document.getElementById('room-id').innerText
    if(roomToJoin != '' && roomToJoin != currentRoom) {
        socket.emit('join-room-request', roomToJoin)
    }
}

function setup() {
    createCanvas(800,600).parent(select('main'))
    background(0);
}