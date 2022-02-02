const socket = io("http://localhost:3000")

// upon recieving the ID of a new room
// when connecting for the first time,
// show the new ID
socket.on('new-room-id', (data) => {
    document.getElementById('room-id').innerText = data.id
})

// when new nickname buttons is pressed
// change the displayed nickname and
// emit the change to the server
document.getElementById('nickname-btn').onclick = () => {
    const newNickname = document.getElementById('nickname-input').value
    if(newNickname != '') {
        document.getElementById('nickname').innerText = newNickname
    }
    
    socket.emit('changed-nickname', {newNickname})
}

function setup() {
    createCanvas(800,600).parent(select('main'))
    background(0);
}