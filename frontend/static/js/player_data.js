export default function initPlayerData() {

// format game time to hours and minutes for display
function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);

    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${
        minutes.toString().padStart(2, '0')
    }:${
        seconds.toString().padStart(2, '0')
    }`;
}

// fetching data from local storage
var highscore = localStorage.getItem('highScore');
var lastScore = localStorage.getItem('lastScore');
var totalPellets = localStorage.getItem('totalPellets');
var totalGhostKills = localStorage.getItem('totalGhostKills');
var totalTime = parseInt(localStorage.getItem('totalTime'));
var lastGameTime = parseInt(localStorage.getItem('lastGameTime'));

// console.log(highscore);

// selecting display html elements
const highScoreDisplay = document.querySelector('#highScoreDisplay');
const lastScoreDisplay = document.querySelector('#lastScoreDisplay');
const totalPelletsDisplay = document.querySelector('#totalPelletsDisplay');
const totalGhostKillsDisplay = document.querySelector('#totalGhostKillsDisplay');
const totalTimeDisplay = document.querySelector('#totalTimeDisplay');
const lastGameTimeDisplay = document.querySelector('#lastGameTimeDisplay');


// displaying data in html elements
if (highscore > 0) {
    highScoreDisplay.innerHTML = highscore;
}

if (lastScore > 0) {
    lastScoreDisplay.innerHTML = lastScore;
}

if (totalPellets > 0) {
    totalPelletsDisplay.innerHTML = totalPellets;
}

if (totalGhostKills > 0) {
    totalGhostKillsDisplay.innerHTML = totalGhostKills;

}

totalTimeDisplay.innerHTML = formatTime(totalTime);


lastGameTimeDisplay.innerHTML = formatTime(lastGameTime);




}