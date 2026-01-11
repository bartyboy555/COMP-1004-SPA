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

// player class
class Player {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        // player radius
        this.radius = 15;
    }

    // drawing circle to look like pacman
    draw() {
        canvasContext.beginPath();
        // circle arc
        canvasContext.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        // player colour
        canvasContext.fillStyle = 'yellow';
        canvasContext.fill()
        canvasContext.closePath;
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}


// creating new instances for game
const boundaries = [];
const player  = new Player({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
});


const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

let lastkey = '';


// 2d array setting map spaces
const map = [
    ['#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', '#', '#', '#', '#', '#', '#'],
]

// loop for 2d map array to set map assests in canvaS
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            // if position is # in map set it to a boundary
            case '#':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        }
                    })
                )
                break
        }
    })
})

// function circle and rectangle colision
function circleColidesWithRectangle( {
    circle,
    rectangle
}) {
    // used in if statements for boundary checks
    // player velocity is also added to stop the player just before they hit a boundary so they dont get stuck
    return (circle.position.y - circle.radius + circle.velocity.y
            <=
            rectangle.position.y + rectangle.height && 
            circle.position.x + circle.radius + circle.velocity.x
            >= 
            rectangle.position.x && 
            circle.position.y + circle.radius + circle.velocity.y
            >= 
            rectangle.position.y && 
            circle.position.x - circle.radius + circle.velocity.x
            <= 
            rectangle.position.x + rectangle.width)
}

// starts game loop in animation function so it is constantly running till we tell it to stop
function animate() {
    requestAnimationFrame(animate);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    // if statements for player movement based on wasd
    // if w key is pressed
    if (keys.w.pressed && lastkey == 'w') {
    // and if any boundary is colided with
    // loop for each boundary
    for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
            // circle collision detection function
            circleColidesWithRectangle({
            circle: {...player, velocity: {
                x: 0,
                y: -5
            }},
            rectangle: boundary
        })
        ) {
            // set player velocity on the y axis to 0
            player.velocity.y = 0;
            break
        } else {
            // else statement to reset player speed once the colision stops prevents player getting stuck in gaps
            // else set velocity to negative to push player up
            player.velocity.y = -5
        }
    }
    } else if (keys.a.pressed && lastkey == 'a') {
        for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
            // circle collision detection function
            circleColidesWithRectangle({
            circle: {...player, velocity: {
                x: -5,
                y: 0
            }},
            rectangle: boundary
        })
        ) {
            // set player velocity on the y axis to 0
            player.velocity.x = 0;
            break
        } else {
            // else statement to reset player speed once the colision stops prevents player getting stuck in gaps
            // else set velocity to negative to push player up
            player.velocity.x = -5
        }
    }
    } else if (keys.s.pressed && lastkey == 's') {
        for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
            // circle collision detection function
            circleColidesWithRectangle({
            circle: {...player, velocity: {
                x: 0,
                y: 5
            }},
            rectangle: boundary
        })
        ) {
            // set player velocity on the y axis to 0
            player.velocity.y = 0;
            break
        } else {
            // else statement to reset player speed once the colision stops prevents player getting stuck in gaps
            // else set velocity to positive to push player down
            player.velocity.y = 5
        }
    }
    } else if (keys.d.pressed && lastkey == 'd') {
        for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
            // circle collision detection function
            circleColidesWithRectangle({
            circle: {...player, velocity: {
                x: 5,
                y: 0
            }},
            rectangle: boundary
        })
        ) {
            // set player velocity on the y axis to 0
            player.velocity.x = 0;
            break
        } else {
            // else statement to reset player speed once the colision stops prevents player getting stuck in gaps
            // else set velocity to negative to push player up
            player.velocity.x = 5
        }
    }
    }

    // loop for each boundary
    boundaries.forEach((boundary) => {
        // draw boundaries
        boundary.draw();

        // if statment to check if player is coliding with boundaries
        if (
            circleColidesWithRectangle({
                circle: player,
                rectangle: boundary
            })
        ) {
            console.log("we are coliding!")
            // stops player moving if colided with boundary
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    })

    // draw and update player on canvas
    player.update();
    // velocity is set to zero at start of movement loop so player can stop if no button is pressed
    // player.velocity.x = 0
    // player.velocity.y = 0;

}

animate();


// loop to draw boundaries
boundaries.forEach((Boundary) => {
    Boundary.draw();
})

// draw and update player on canvas
player.update();

// event listener to listen for player movement keys wasd being pressed
addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = true;
            lastkey = 'w';
            break
        case 'a':
            keys.a.pressed = true;
            lastkey = 'a';
            break
        case 's':
            keys.s.pressed = true;
            lastkey = 's';
            break
        case 'd':
            keys.d.pressed = true;
            lastkey = 'd';
            break
    }

    //console.log(player.velocity);
})

// event listener to reset player velocity when movement key is no longer pressed
addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false;
            break
        case 'a':
            keys.a.pressed = false;
            break
        case 's':
            keys.s.pressed = false;
            break
        case 'd':
            keys.d.pressed = false;
            break
    }

    //console.log(player.velocity);
})