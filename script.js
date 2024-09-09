var score = 0;
var clickingPower = 1;

var cursorCost = 15;
var cursors = 0;

var grandmaCost = 100;
var grandmas = 0;

var butlerCost = 500;
var butlers = 0;



function buyCursor() {
    if (score >= cursorCost) {
        score = score - cursorCost;
        cursors = cursors + 1;
        cursorCost = Math.round(cursorCost * 1.15)

        document.getElementById("score").innerHTML = score;
        document.getElementById("cursors").innerHTML = cursors;
        document.getElementById("cursorcost").innerHTML = cursorCost;
        updateScorePerSecond();
    }
    
}

function buyGrandma() {
    if (score >= grandmaCost) {
        score = score - grandmaCost;
        grandmas = grandmas + 1;
        grandmaCost = Math.round(grandmaCost * 1.3)

        document.getElementById("score").innerHTML = score;
        document.getElementById("grandmas").innerHTML = grandmas;
        document.getElementById("grandmacost").innerHTML = grandmaCost;
        updateScorePerSecond();
    }
    
}

function buyButler() {
    if (score >= butlerCost) {
        score = score - butlerCost;
        butlers = butlers + 1;
        butlerCost = Math.round(butlerCost * 1.65)

        document.getElementById("score").innerHTML = score;
        document.getElementById("butlers").innerHTML = butlers;
        document.getElementById("butlercost").innerHTML = butlerCost;
        updateScorePerSecond();
    }
    
}

function addToScore(amount) {

    score = score + amount;
    document.getElementById("score").innerHTML = score;
    
}


function playMeow() {
    // Create a new audio instance for each click
    var meowSound = new Audio('Sounds/nya.mp3');
    
    // Play the sound and handle any playback issues
    meowSound.play().catch(function(error) {
        console.error("Audio playback failed:", error);
    });
}

function updateScorePerSecond() {
    scorePerSecond = cursors + grandmas * 5 + butlers * 7;
    document.getElementById("scorepersecond").innerHTML = scorePerSecond
}
           

function saveGame() {
    var gameSave = {
        scorePerSecond: scorePerSecond,
        score: score,
        clickingPower: clickingPower,
        cursorCost: cursorCost,
        cursors: cursors,
        grandmaCost: grandmaCost,
        grandmas: grandmas,
        butlerCost: butlerCost,
        butlers: butlers

    };
    localStorage.setItem("gameSave", JSON.stringify(gameSave));
}

function loadGame() {
    var savedGame = JSON.parse(localStorage.getItem("gameSave"));
    if(typeof savedGame.score !=="undefined") score = savedGame.score;
    if(typeof savedGame.clickingPower !=="undefined") clickingPower = savedGame.clickingPower;
    if(typeof savedGame.cursorCost !=="undefined") cursorCost = savedGame.cursorCost;
    if(typeof savedGame.cursors !=="undefined") cursors = savedGame.cursors;
    if(typeof savedGame.grandmaCost !=="undefined") grandmaCost = savedGame.grandmaCost;
    if(typeof savedGame.grandmas !=="undefined") grandmas = savedGame.grandmas;
    if(typeof savedGame.butlerCost !=="undefined") butlerCost = savedGame.butlerCost;
    if(typeof savedGame.butlers !=="undefined") butlers = savedGame.butlers;
    if(typeof savedGame.scorePerSecond !=="undefined") scorePerSecond = savedGame.scorePerSecond;
}

window.onload = function() {
    loadGame();
    updateScorePerSecond();
    document.getElementById("score").innerHTML = score;
    document.getElementById("cursors").innerHTML = cursors;
    document.getElementById("cursorcost").innerHTML = cursorCost;
    document.getElementById("score").innerHTML = score;
    document.getElementById("grandmas").innerHTML = grandmas;
    document.getElementById("grandmacost").innerHTML = grandmaCost;
    document.getElementById("score").innerHTML = score;
    document.getElementById("butlers").innerHTML = butlers;
    document.getElementById("butlercost").innerHTML = butlerCost;
};

function resetGame() {
    if (confirm("Are you sure you want to reset your game?")) {
        var gameSave = {};
        localStorage.setItem("gameSave", JSON.stringify(gameSave));
        location.reload();
        alert("Game Resetted!")
    }
}

//AutoClicker Feature
setInterval(function () {
    addToScore(cursors);

    document.title = score + " Neko's -- Neko Clicker "
}, 1000);

//Grandma feature
setInterval(function () {
    addToScore(grandmas * 5);
    addToScore(butlers * 7)
}, 1000);

setInterval(function() {
    saveGame();
}, 30000);

document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.which == 83) {
        event.preventDefault();
        saveGame();
        alert("Game Saved!");
    }
}, false);