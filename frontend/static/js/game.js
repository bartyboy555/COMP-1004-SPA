//console.log("game.js is loaded");

// hiding rety button
var button = document.getElementById("retryButton")
button.style.display = "none";

// html canvas variables
const canvas = document.querySelector('canvas');
const canvasContext = canvas.getContext('2d');

const scoreElement = document.querySelector('#scoreElement');

// setting canvas dimensions
canvas.width = 450;
canvas.height = 700;

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
        // player speed
        this.speed = 3;
    }

    // drawing circle to look like pacman
    draw() {
        canvasContext.beginPath();
        // circle arc
        canvasContext.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        // player colour
        canvasContext.fillStyle = 'yellow';
        canvasContext.fill()
        canvasContext.closePath();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    
}


// pacman tail class
class TailSegment {
    constructor ({ position }) {
        this.position = position;
        // tail with and height
        this.width = 20;
        this.height = 20;
        // tail and corner radius
        this.radius = 13;
        this.cornerRadius = 12;
        this.colour = 'yellow';
    }

    
    drawTailCenter(index) {

        // checking if current tail segment is a corner of tail

        // storing previous and next tail segment
        const prevTailSeg = tail[index - 1];
        const nextTailSeg = tail[index + 1];

        let turning = false;

        if (prevTailSeg && nextTailSeg) {

            // calculating diferent in positions
            const diffX1 = prevTailSeg.position.x - this.position.x;
            const diffY1 = prevTailSeg.position.y - this.position.y;

            const diffX2 = nextTailSeg.position.x - this.position.x;
            const diffY2 = nextTailSeg.position.y - this.position.y

            // current tail segment is corner if there is a difference in positions with previous and next segments
            // if so turning = true
            turning = (diffX1 !== diffX2 && diffY1 !== diffY2);
        }

        canvasContext.beginPath();
            // draw middle of tail as a rectangle
            canvasContext.rect(
                this.position.x- this.width / 2,
                this.position.y- this.height / 2,
                this.width,
                this.height
            )
            
        canvasContext.fillStyle = this.colour;
        canvasContext.fill()

        canvasContext.closePath();

        // if the current tail segment is a corner draw a circle instead
        if (turning) {
            this.drawCornerCircle();
            // console.log("circles are being drawn")
        }
    }

    drawTailEnds() {
        canvasContext.beginPath();
        // draw start and end of tail as rounded rectangles
        canvasContext.roundRect(
            this.position.x - this.width / 2,
            this.position.y - this.height / 2,
            this.width,
            this.height,
            this.height / 2
        )
        canvasContext.fillStyle = this.colour;
        canvasContext.fill();
        canvasContext.closePath();
    }

    // function to draw cirles for corners of tail
    drawCornerCircle() {

        canvasContext.beginPath();

        canvasContext.arc(
            this.position.x,
            this.position.y,
            this.cornerRadius,
            0,
            Math.PI * 2
        );

        canvasContext.fillStyle = this.colour;
        canvasContext.fill();
        canvasContext.closePath();

    }

    update(index) {
        // gets index for specific tail segment
        const historyIndex = positionHistory.length -1 -index * 3;

        if (historyIndex >= 0) {
            this.position.x = positionHistory[historyIndex].x;
            this.position.y = positionHistory[historyIndex].y;
        }

    }
}

// ghost class
class Ghost {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        // ghost radius
        this.radius = 15;
        // ghost speed
        this.speed = 5;
        // array to store previous collisions
        this.preCollisions = []
    }

    // drawing ghost
    draw() {
        canvasContext.beginPath();
        // circle arc
        canvasContext.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        // ghost colour
        canvasContext.fillStyle = 'red';
        canvasContext.fill()
        canvasContext.closePath();
    }

    // update ghost position
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    
}


// pellet class
class Pellet {
    constructor({ position }) {
        this.position = position;
        // pellet radius
        this.radius = 8;
    }

    // drawing pellet 
    draw() {
        canvasContext.beginPath();
        // circle arc
        canvasContext.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        // pellet colour
        canvasContext.fillStyle = 'white';
        canvasContext.fill()
        canvasContext.closePath();
    }

    
}


// creating new instances and variables for game
// boolean to keep game running
let game = true;
// pellet and boundary position arrays
const pellets = [];
const boundaries = [];
// player instance from class
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
// tail array to store pacman tail segment positions
const tail = [];
// array to store player positon history
const positionHistory = [];

// ghost array
const ghosts = [
    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.width + Boundary.width / 2
        },
        velocity: {
            x: 5,
            y: 0
        }
    })
]




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
    },
    any: {
        pressed: false
    }
}

let lastkey = '';
let score = 0;


// 2d array setting map spaces
const map = [
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', '.', '.', '.', '.', '.', '.', '.', ' ', '#'],
    ['#', '.', '#', '.', '#', '#', '#', '.', '#', '.', '#'],
    ['#', '.', '.', '.', '.', '#', '.', '.', '.', '.', '#'],
    ['#', '.', '#', '#', '.', '.', '.', '#', '#', '.', '#'],
    ['#', '.', '.', '.', '.', '#', '.', '.', '.', '.', '#'],
    ['#', '.', '#', '.', '#', '#', '#', '.', '#', '.', '#'],
    ['#', '.', '.', '.', '.', '#', '.', '.', '.', '.', '#'],
    ['#', '.', '#', '#', '.', '.', '.', '#', '#', '.', '#'],
    ['#', '.', '.', '.', '.', '#', '.', '.', '.', '.', '#'],
    ['#', '.', '#', '.', '#', '#', '#', '.', '#', '.', '#'],
    ['#', '.', '.', '.', '.', '#', '.', '.', '.', '.', '#'],
    ['#', '.', '#', '#', '.', '.', '.', '#', '#', '.', '#'],
    ['#', '.', '.', '.', '.', '#', '.', '.', '.', '.', '#'],
    ['#', '.', '#', '.', '#', '#', '#', '.', '#', '.', '#'],
    ['#', ' ', '.', '.', '.', '.', '.', '.', '.', ' ', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
]

// loop for 2d map array to set map assests in canvas
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            // boundary case
            // if position is # in map set it to a boundary
            case '#':
                // store in boundaries array
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        }
                    })
                )
                break
            
            // pellet case
            // if position is a . in map set it to a pellet
            case '.':
                // store in pellets array
                pellets.push(
                    new Pellet({
                        position: {
                            // set position with the width/height divided by 2 so asset is in center of box when drawn
                            x: Boundary.width * j + Boundary.width / 2,
                            y: Boundary.height * i + Boundary.height / 2
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




let gameOverReason = " ";

// variable for calculating monitor frames per second
let frames = 0;

// gets elapsed time since page loaded in ms
let msPrev = window.performance.now();
// console.log(msNow);

// fps and ms limit for html canvas
// prevents player going to quick as it limits the amount of pixels per second they move
const fps = 60;
const msPerFrame = 1000 / fps ;

// starts game loop in animation function so it is constantly running till we tell it to stop
function animate() {

    // if game is true continue to render game
    if (game === true) {
    requestAnimationFrame(animate);

    // calculating difference in time since page load and first frame of canvas
    const msNow = window.performance.now()
    const msPassed = msNow - msPrev;

    if (msPassed < msPerFrame) return;
    
    // get the remainder of msPassed
    const excessTime = msPassed % msPerFrame;

    // make previous time current time
    // only called when msPassed is greater than 16.67ms
    msPrev = msNow - excessTime;

    // increase frame variable
    frames++
    
    // clear canvas
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    // if statements for player movement based on wasd
    if (keys.w.pressed && lastkey == 'w') {

    // loop for each boundary
    for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
            // circle collision detection function
            circleColidesWithRectangle({
            circle: {...player, velocity: {
                x: 0,
                y: -player.speed
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
            player.velocity.y = -player.speed
        }
    }
    } else if (keys.a.pressed && lastkey == 'a') {

        
        for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
            // circle collision detection function
            circleColidesWithRectangle({
            circle: {...player, velocity: {
                x: -player.speed,
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
            player.velocity.x = -player.speed
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
                y: player.speed
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
            player.velocity.y = player.speed
        }
    }
    } else if (keys.d.pressed && lastkey == 'd') {

        for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
            // circle collision detection function
            circleColidesWithRectangle({
            circle: {...player, velocity: {
                x: player.speed,
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
            player.velocity.x = player.speed
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
            //console.log("we are coliding!")
            // stops player moving if colided with boundary
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    })

    if (tail.length > 10) {
    // if player head collides with tail end
        const tailEnd = tail[tail.length - 1];

        // collision detection for player head touching tail end
        const distance = Math.hypot(
            player.position.x - tailEnd.position.x,
            player.position.y - tailEnd.position.y
        );

        if (
            distance < player.radius + tailEnd.radius) {
                //console.log("player hit tail")
                // stop game when player hits tail end
                game = false;
                gameOverReason = "You tried to eat your own Tail!";
            }
        }


    // loop through each of the pellets in the array
    // in order to not update pellets that haven't been removed
    // prevents pellet flashing bug
    for (let i = pellets.length - 1; 0 <= i; i--) {
        const pellet = pellets[i]
         // draw pellet
        pellet.draw()

        // collision detection with player
        // if player collides with pellet
        if (Math.hypot(
            pellet.position.x - player.position.x,
            pellet.position.y - player.position.y
        ) <
        pellet.radius + player.radius
    ) {
        //console.log("player is coliding with pellet")
        // add to score
        score += 1;
        // update html element
        scoreElement.innerHTML = score;
        // remove pellet
        pellets.splice(i, 1);

        // creates a new tail segment when player eats pellet
        // stores new instance of tail segement in array
        tail.push(
            new TailSegment({
                position: {
                    x: positionHistory[positionHistory.length -1].x,
                    y: positionHistory[positionHistory.length -1].y
                }
            })
        )

    }
    }



// update player on canvas
    player.update();


// updates tail position based on last player position when player is moving
if (player.velocity.x !==0 || player.velocity.y !==0) {

        // stores players last position in array
    positionHistory.push({
        x: player.position.x,
        y: player.position.y
    });

    // deletes oldest entry position in array when array gets too big
    if (positionHistory.length > 300) {
        positionHistory.shift();

    }
    
}

 // update player tail
    tail.forEach((TailSegment, index) => {
        TailSegment.update(index);
    })


     // draw tail segments on canvas
    tail.forEach((TailSegment, index) => {
        // if tail segment is at the start of end of array
        if (index === 0 || index === tail.length -1) {
        // draw as a rounded rectangle
            TailSegment.drawTailEnds();
        } else {
        // draw as a rectangle
            TailSegment.drawTailCenter(index);
        }
    })

    ghosts.forEach((ghost) => {

        // ghost collision prediction
        const ghostCollisions = [];
        boundaries.forEach((boundary) => {
            if (
                !ghostCollisions.includes('right') &&
                circleColidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: ghost.speed,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ) {
                ghostCollisions.push('right');
            }

            if (
                !ghostCollisions.includes('left') &&
                circleColidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: -ghost.speed,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ) {
                ghostCollisions.push('left');
            }

            if (
                !ghostCollisions.includes('up') &&
                circleColidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 0,
                            y: -ghost.speed
                        }
                    },
                    rectangle: boundary
                })
            ) {
                ghostCollisions.push('up');
            }

            if (
                !ghostCollisions.includes('down') &&
                circleColidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 0,
                            y: ghost.speed
                        }
                    },
                    rectangle: boundary
                })
            ) {
                ghostCollisions.push('down');
            }
        })

        // update prevCollisions array if ghostCollisions has been updated
        if ( ghostCollisions.length > ghost.preCollisions.length ) { 
        ghost.preCollisions = ghostCollisions;
        }

        if ( JSON.stringify(ghostCollisions) != JSON.stringify(ghost.preCollisions) ) {
            //console.log("test")
        }
        console.log(ghostCollisions);
        console.log(ghost.preCollisions);
        ghost.update();
    })




    // draw player head on canvas
    player.draw();

    ghosts.forEach((ghost) =>  {
        ghost.draw();
    })



    //console.log(tail);
    //console.log(positionHistory);

    }

    // if game ends
    else if (game === false) {

        // change canvas dimesions to make room for html elements
        canvas.height = 150;

        // draw game over screen

        // clearing canvas
        canvasContext.clearRect(0,0, canvas.width, canvas.height);
        // text settings
        canvasContext.font = "50px arial";
        canvasContext.fillStyle = "yellow";
        canvasContext.textAlign = "center";
        // canvasContext.textBaseline = "top";
        // drawing text
        canvasContext.fillText("Game Over!", canvas.width / 2, 50);


        canvasContext.fillStyle = "white";
        canvasContext.font = "20px arial";

        // drawing next line
        canvasContext.fillText(gameOverReason, canvas.width / 2, 90);

        // reveal retry button
        button.style.display = "block";

    }


}


animate();

// log frames variable per second to console
// displays frames counted per second
//setInterval(() => {
//    console.log(frames)
//}, 1000);


// loop to draw boundaries
boundaries.forEach((Boundary) => {
    Boundary.draw();
})







// event listener to listen for player movement keys wasd being pressed
addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'w':
            keys.any.pressed = true;
            keys.w.pressed = true;
            lastkey = 'w';
            break
        case 'a':
            keys.any.pressed = true;
            keys.a.pressed = true;
            lastkey = 'a';
            break
        case 's':
            keys.any.pressed = true
            keys.s.pressed = true;
            lastkey = 's';
            break
        case 'd':
            keys.any.pressed = true;
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
            keys.any.pressed = false;
            keys.w.pressed = false;
            break
        case 'a':
            keys.any.pressed = false;
            keys.a.pressed = false;
            break
        case 's':
            keys.any.pressed = false;
            keys.s.pressed = false;
            break
        case 'd':
            keys.any.pressed = false;
            keys.d.pressed = false;
            break
    }

    //console.log(player.velocity);
})

