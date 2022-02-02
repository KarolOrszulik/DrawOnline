const socket = io("http://localhost:3000")

function setup() {
    createCanvas(800,600).parent(select('main'))
    background(0);
}