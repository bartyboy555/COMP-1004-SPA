export default function initPlayerData() {
// fetching highscore from local storage
var highscore = localStorage.getItem('highScore');

console.log(highscore);

// selecting high score display in html
const highScoreDisplay = document.querySelector('#highScoreDisplay');

if (highscore > 0) {
    highScoreDisplay.innerHTML = highscore;
}

}