const socket = io("http://localhost:3000")

// upon recieving the ID of a new room
// when connecting for the first time,
// show the new ID
socket.on('init', (data) => {
    document.getElementById('room-id').innerText = data.id
    document.getElementById('nickname').innerText = data.nickname
})

socket.on('join-room-greenlight', (data) => {
    document.getElementById('room-id').innerText = data.roomToJoin
    console.log(data.nicknamesInRoom)
})

// when new nickname button is pressed
// change the displayed nickname and
// emit the change to the server
document.getElementById('nickname-btn').onclick = () => {
    const newNickname = document.getElementById('nickname-input').value
    if(newNickname != '') {
        document.getElementById('nickname').innerText = newNickname
        socket.emit('changed-nickname', {newNickname})
    }
}

document.getElementById('join-room-btn').onclick = () => {
    const roomToJoin = document.getElementById('join-room-input').value
    socket.emit('join-room-request', {roomToJoin})
}

function setup() {
    createCanvas(800,600).parent(select('main'))
    background(0);
}