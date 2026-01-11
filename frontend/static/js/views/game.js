// html canvas variables
const canvas = document.querySelector('canvas');
const canvasContext = canvas.getContext('2d');

// setting canvas dimensions
canvas.width = innerWidth;
canvas.height = innerHeight;

// Boundary class
class Boundary {
    // static variable in class to be used in other places
    static width = 40;
    static height = 40;
    constructor({ position }) {
        this.position = position;
        this.width = 40;
        this.height = 40;
    }

    // draw boundary
    draw() {
        // colour is blue
        canvasContext.fillStyle = 'blue';
        // boundary is a rectangle
        canvasContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

// 2d array setting map spaces
const map = [
    ['#', '#', '#', '#', '#', '#'],
    ['#', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', '#', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', '#'],
    ['#', '#', '#', '#', '#', '#'],
]

// setting boundary positions in array to keep them together
const boundaries = []

// loop for 2d map array to set map assests in canvaS
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            // if position is - in map set it to a boundary
            case '#':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        }
                    })
                )
        }
    })
})


// loop to draw all boundaries
boundaries.forEach((Boundary) => {
    Boundary.draw();
})