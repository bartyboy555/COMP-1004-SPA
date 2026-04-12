//console.log("game.js is loaded");

// hiding rety button
var button = document.getElementById("retryButton")
button.style.display = "none";

// html canvas variables
const canvas = document.querySelector('canvas');
const canvasContext = canvas.getContext('2d');

const scoreElement = document.querySelector('#scoreElement');

const livesElement = document.querySelector('#livesElement');

// setting canvas dimensions
canvas.width = 450;
canvas.height = 700;


let colNum = 0;
let rowNum = 0;

// 2d array setting map spaces
const map = [
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '.', '.', '.', '.', '.', '.', '.', '.', '.', '#'],
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
    ['#', '.', '.', '.', '.', '.', '.', '.', '.', '.', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
]


// function for getting random map numbers for random placement
function getRandomInt(maxNum) {
    return Math.floor(Math.random() * maxNum);
}

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
    static lives = 3;
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        // player radius
        this.radius = 15;
        // player chomp animation variables
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
        // player speed
        this.speed = 2;
    }

    // drawing circle to look like pacman
    draw() {
        canvasContext.save();
        canvasContext.translate(this.position.x, this.position.y)
        canvasContext.rotate(this.rotation)
        canvasContext.translate(-this.position.x, -this.position.y)
        canvasContext.beginPath();
        // circle arc
        canvasContext.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians);
        canvasContext.lineTo(this.position.x, this.position.y)
        // player colour
        canvasContext.fillStyle = 'yellow';
        canvasContext.fill()
        canvasContext.closePath();
        canvasContext.restore();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.radians < 0 || this.radians > .75)
            this.openRate = -this.openRate

        this.radians += this.openRate
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
        this.endColour = 'orange';
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
        canvasContext.fillStyle = this.endColour;
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
        const historyIndex = positionHistory.length -1 -(index + 2) * 3;

        if (historyIndex >= 0) {
            this.position.x = positionHistory[historyIndex].x;
            this.position.y = positionHistory[historyIndex].y;
        }

    }
}

// ghost class
class Ghost {
    static speed = 2;
    static amount = 1;
    constructor({ position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        // ghost radius
        this.radius = 15;
        // ghost speed
        this.speed = 2;
        // array to store previous collisions
        // starts with directions to pick from
        this.prevCollisions = ['up','down','left','right']
        // ghosts have randomly picked colors
        this.colors = ['red', 'pink', 'orange'];
        this.color = this.colors[getRandomInt(this.colors.length)]
        this.scared = false
    }

    // drawing ghost
    draw() {
        canvasContext.beginPath();
        // circle arc
        canvasContext.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        // ghost colour
        // if ghost is scared make blue otherwise default colour
        canvasContext.fillStyle = this.scared ? 'blue': this.color;
        canvasContext.fill()
        canvasContext.closePath();
    }

    // update ghost position
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    static randomPlacing() {
    // spawns ghosts in random place
    for (let i = 0; i < Ghost.amount; i++) {

    do {
        colNum = getRandomInt(map[0].length);
        rowNum = getRandomInt(map.length);
    } while (map[rowNum][colNum] === '#' || (rowNum === 1 && colNum === 1) );

    map[rowNum][colNum] = 'G';
}
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

// powerup class
class PowerUp {
    // amount of power ups spawned on map
    static amount = 3;
    constructor({ position }) {
        this.position = position;
        // pellet radius
        this.radius = 10;
    }

    // drawing pellet 
    draw() {
        canvasContext.beginPath();
        // circle arc
        canvasContext.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        // pellet colour
        canvasContext.fillStyle = 'purple';
        canvasContext.fill()
        canvasContext.closePath();
    }

    static randomPlacing() {
        // spawns powerups in a random place
    for (let i = 0; i < PowerUp.amount; i++) {

    do {
        // gets random positions on map
        colNum = getRandomInt(map[0].length);
        rowNum = getRandomInt(map.length);
        // while its a boundary or where the player spawns
    } while (map[rowNum][colNum] === '#' || (rowNum === 1 && colNum === 1) );

    // sets position as powerup
    map[rowNum][colNum] = 'P';

}
    }
}


// creating new instances and variables for game
// boolean to keep game running
let game = true;
let nextRound = false;
let rounds = 0;
let playerImunity = false;
// position arrays
const pellets = [];
const boundaries = [];
const powerUps = [];
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
const ghosts = [];





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


// spawns powerups in a random place
PowerUp.randomPlacing();

// spawns ghosts in random place
Ghost.randomPlacing();


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

            case 'P':
                // store in powerUps array
                powerUps.push(
                    new PowerUp({
                        position: {
                            // set position with the width/height divided by 2 so asset is in center of box when drawn
                            x: Boundary.width * j + Boundary.width / 2,
                            y: Boundary.height * i + Boundary.height / 2
                        }
                    })
                )
                break

            case "G":
                // pick random colour for ghost
                ghosts.push(
                new Ghost({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    velocity: {
                        x: 0,
                        y: 0
                    }
                })
            )
            break;
        }
    })
})

// function circle and rectangle colision prediction
function circleRectCollisionPrediction( {
    circle,
    rectangle
}) {
    // used in if statements for predictive boundary checks
    // velocity is also added to stop the object just before they hit a boundary so they dont get stuck
    const padding = Boundary.width / 2 - circle.radius - 1;
    return (circle.position.y - circle.radius + circle.velocity.y
            <=
            rectangle.position.y + rectangle.height + padding && 
            circle.position.x + circle.radius + circle.velocity.x
            >= 
            rectangle.position.x - padding && 
            circle.position.y + circle.radius + circle.velocity.y
            >= 
            rectangle.position.y - padding && 
            circle.position.x - circle.radius + circle.velocity.x
            <= 
            rectangle.position.x + rectangle.width + padding)
}

// function for cicle and rectangle colision detection
function circleRectCollisionDetection( {
    circle,
    rectangle
}) {
    const closestX = Math.max(rectangle.position.x, (Math.min(circle.position.x,  rectangle.position.x + rectangle.width)));
    const closestY = Math.max(rectangle.position.y, (Math.min(circle.position.y, rectangle.position.y + rectangle.height)))

    const dx = circle.position.x - closestX;
    const dy = circle.position.y - closestY;

    return (dx * dx + dy * dy) <= (circle.radius * circle.radius);
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
            circleRectCollisionPrediction({
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
            circleRectCollisionPrediction({
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
            circleRectCollisionPrediction({
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
            circleRectCollisionPrediction({
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

    // if statements for player rotation
    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5

     // loop for each boundary
    boundaries.forEach((boundary) => {
        // draw boundaries
        boundary.draw();

        // if statment to check if player will colide with boundaries
        if (
            circleRectCollisionPrediction({
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
                if (Player.lives <= 0) {
                game = false
                gameOverReason = "You tried to eat your own Tail!";
                } else if (playerImunity === false) {
                    Player.lives--;
                    livesElement.innerHTML = Player.lives;
                    playerImunity = true;

                    setTimeout(() => {
                        playerImunity = false;
                    }, 2000);
                }
            }

        // loop for checking if any of the ghosts are colliding with the player tail
        // checks each ghost and tail segment
        for (let i = tail.length - 1; 0<= i; i--) {
            const tailSeg = tail[i];
            // console.log(tailSeg);
            for (let g = ghosts.length - 1; 0<= g; g--) {
            const ghost = ghosts[g]
            // console.log(ghost);
                if (circleRectCollisionDetection({
                    circle: ghost,
                    rectangle: tailSeg
                })) {
                    // if ghost collides with tail cut off tail from their and remove score
                    // console.log("ghost collided with tail section")
                    let removedTailAmount = tail.length - i;
                    // remove tail sections from array
                    tail.splice(i, removedTailAmount);
                    // subtract score
                    score = score - removedTailAmount;
                    scoreElement.innerHTML = score;
                    removedTailAmount = 0;
                }
        }
        }

        }

    
    // powerup conditions
    for (let i = powerUps.length - 1; 0 <= i; i--) {
    const powerUp = powerUps[i]
     // draw powerups 
    powerUp.draw()

    // collision detection with player
    // if player collides with powerup
        if (Math.hypot(
            powerUp.position.x - player.position.x,
            powerUp.position.y - player.position.y
        ) <
        powerUp.radius + player.radius
    ) {
        // add to score
        score += 5;
        // update html element
        scoreElement.innerHTML = score;
        // remove power up
        powerUps.splice(i, 1)

        // make ghosts scared
        ghosts.forEach(ghost => {
            ghost.scared = true
            // console.log(ghost.scared)

            setTimeout(() => {
                ghost.scared = false
                // console.log(ghost.scared)
            // ghosts scared for 5 seconds
            }, 10000)
        })
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
    if (positionHistory.length > 1000) {
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

    // if all pellets are collected
    if (pellets.length === 0) {
        // console.log("next round");
        nextRound = true;
    }

    for (let i = ghosts.length - 1; 0 <= i; i--) {
        const ghost = ghosts[i];

    // ghost player collsion detection
    if (Math.hypot(
            ghost.position.x - player.position.x,
            ghost.position.y - player.position.y
        ) <
        // game doesnt end if ghost is scared
        ghost.radius + player.radius 
    ) {
        // remove ghost if scared and player collides
        if (ghost.scared) {
            // add to score
            score += 10;
            // update html element
            scoreElement.innerHTML = score;
            ghosts.splice(i, 1);
        } else if (Player.lives <= 0){
        // else ghost touch player head lose player life
        game = false;
        gameOverReason = "A ghost ate you!!"
        // if player has lives remove one and update lives element
    } else if (playerImunity === false ){
        Player.lives--;
        livesElement.innerHTML = Player.lives;
        playerImunity = true;

        setTimeout(() => {
            playerImunity = false;
        }, 2000);
    }
}



        // ghost collision prediction with boundaries
        const ghostCollisions = [];
        boundaries.forEach((boundary) => {
            if (
                !ghostCollisions.includes('right') &&
                circleRectCollisionPrediction({
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
                circleRectCollisionPrediction({
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
                circleRectCollisionPrediction({
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
                circleRectCollisionPrediction({
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
        if ( ghostCollisions.length > ghost.prevCollisions.length ) { 
        ghost.prevCollisions = [...ghostCollisions];
        }

        // finding pathways ghost can take
        if ( JSON.stringify(ghostCollisions) != JSON.stringify(ghost.prevCollisions) ) {
            //console.log("test")
        
        if (ghost.velocity.x > 0) 
            ghost.prevCollisions.push('right');
        else if (ghost.velocity.x < 0) 
            ghost.prevCollisions.push('left');
        else if (ghost.velocity.y < 0)
            ghost.prevCollisions.push('up');
        else if (ghost.velocity.y > 0)
            ghost.prevCollisions.push('down');


        // console.log(ghostCollisions);
        // console.log(ghost.prevCollisions);

        // get possible ghost pathways based on difference between previous collisions and current collisions
        const pathways = ghost.prevCollisions.filter(collision => {
            return !ghostCollisions.includes(collision);
        })
        // print possible pathways
        // console.log({ pathways })

        // pick random direction
        const direction = pathways[Math.floor(Math.random() * pathways.length)]

        // print ghost chosen direction
        // console.log({ direction });

        // move ghost in direction picked
        switch (direction) {
            case 'down' :
                ghost.velocity.y = ghost.speed
                ghost.velocity.x = 0
                break
            case 'up' :
                ghost.velocity.y = -ghost.speed
                ghost.velocity.x = 0
                break
            case 'right' :
                ghost.velocity.y = 0
                ghost.velocity.x = ghost.speed
                break
            case 'left' :
                ghost.velocity.y = 0
                ghost.velocity.x = -ghost.speed
                break
        }

        // reset collisions when direction has been picked
        ghost.prevCollisions = []
        }
        
        ghost.update();
    }


    // draw player head on canvas
    player.draw();

    ghosts.forEach((ghost) =>  {
        ghost.draw();
    })



    //console.log(tail);
    //console.log(positionHistory);

    }

    if (nextRound === true) {
        // increase round count
        rounds++;
        console.log("new round")

        // empty ghosts array from previous round
        ghosts.splice(0, ghosts.length);
        // removes previous powerups
        powerUps.splice(0, powerUps.length);
        // remove starting positions of previous ghosts and powerups
        map.forEach((row, i) => {
            row.forEach((symbol, j) => {
                switch (symbol) {
                    case 'G':
                        map[i][j] = '.';
                        break
                    
                    case 'P':
                        map[i][j] = '.';
                        break
                }
            })
        })

        if (rounds >= 3) {
            powerUps.amount--;
        } else if (rounds < 3) {
            Ghost.amount++;
        }

        // spawns powerups in a random place
        PowerUp.randomPlacing();

        // spawns ghosts in random place
        Ghost.randomPlacing();
        
        // place new items in next round
        map.forEach((row, i) => {
            row.forEach((symbol, j) => {
                switch (symbol) {
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
        
                    case 'P':
                        // store in powerUps array
                        powerUps.push(
                            new PowerUp({
                                position: {
                                    // set position with the width/height divided by 2 so asset is in center of box when drawn
                                    x: Boundary.width * j + Boundary.width / 2,
                                    y: Boundary.height * i + Boundary.height / 2
                                }
                            })
                        )
                        break
        
                    case "G":
                        // pick random colour for ghost
                        ghosts.push(
                        new Ghost({
                            position: {
                                x: Boundary.width * j + Boundary.width / 2,
                                y: Boundary.height * i + Boundary.height / 2
                            },
                            velocity: {
                                x: 0,
                                y: 0
                            }
                        })
                    )
                    break;
                }
            })
        })

        nextRound = false;
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

        canvasContext.fillText("Rounds complete: " + rounds, canvas.width / 2, 120)

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

