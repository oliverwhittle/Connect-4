let socket = io();

//<--------BUTTONS-------->//
const startButton = document.querySelector('.btn-start');
const AIButton = document.querySelector('.btn-AI');
const statsButton = document.querySelector('.btn-stats');
const restartButton = document.querySelector('.btn-restart');
const menuButton = document.querySelector('.btn-menu');
const confirmButton = document.querySelector('.inputLable');
const creategameButton = document.querySelector('.btn-create-game');
const joingameButton = document.querySelector('.btn-join-game');

//<-----------SECTIONS---------->//
const mainMenu = document.querySelector('.mainMenu')
const gameScreen = document.querySelector('.gameScreen')

const playerLogin = document.querySelector('.playerLogin');
const playerstatsPage = document.querySelector('.playerstatsPage');
const gameSettings = document.querySelector('.gameSettings');

//<-----------MISC---------->//
const roomCode = document.querySelector('.roomCode')
const joinCode = document.querySelector('.joinCode')
const gameResults = document.querySelector('.gameResults');
const userName = document.querySelector('.userName');
const winningPlayer = document.querySelector('.winningPlayer');
const playerstatsName = document.querySelector('.playerstatsName');
const playerstatsWins = document.querySelector('.playerstatsWins');

const R_class = 'R'
const Y_class = 'Y'
const drawingCombos = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41]
const cellElement = document.querySelectorAll('[data-cell]')
const row = document.querySelectorAll('[row]')
const gridElement = document.getElementById('gameGrid')
const barChart = document.getElementById('myChart');

var gamestate = {board: [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "], turn: "R", origional: "Y", winner: ""};
var AIgamestate = [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "];
let rTurn = "R"
let origionalTurn
let clientTurn
let playerCount = 0
var lines
var playingAiGame = false;
var playingGame = false;
var gameOver = false;

startButton.addEventListener('click', () => {
    playingAiGame = false;
    mainMenu.style.display = "none";
    gameSettings.style.display = "block";
    menuButton.style.display = "block"
});

creategameButton.addEventListener('click', () => {
    const random = (length = 8) => {
        return Math.random().toString(16).substr(2, length);
    };
    roomCode.textContent = random(6) 
});

joingameButton.addEventListener('click', () => {
    console.log(joinCode.value)
    if (joinCode.value.length > 0){
        console.log("THIS RUNS")
        gamestate = {board: [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "], turn: "R", origional: "Y", winner: ""};
        playingGame = true;
        socket.emit('waitingRoom', joinCode.value, socket.io.engine.id, gamestate);
    }
});

restartButton.addEventListener('click', () => {
    if (playingAiGame == true){
        runAIGame();
    }else if (playingAiGame == false){
        socket.emit('reloadGame', socket.io.engine.id);
    }
});

socket.on('gameReloaded', (data) => {
    gamestate = {board: [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "], turn: "R", origional: "Y", winner: ""};
    socket.emit('updateGamestate', gamestate, socket.io.engine.id)
    socket.emit('gameRestart', socket.io.engine.id, gamestate);
})

menuButton.addEventListener('click', () => {
    if (playingAiGame == true){
        menu();
    }else if (playingGame == true){
        socket.emit('quitGame', socket.io.engine.id);
    }else{
        menu();
    }
});

socket.on('gameLeft', (data) => {
    gamestate = {board: [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "], turn: "R", origional: "Y", winner: ""};
    socket.emit('updateGamestate', gamestate, socket.io.engine.id)
    socket.emit('allplayersLeave', socket.io.engine.id);
    playingGame == false;
    menu();
});

AIButton.addEventListener('click', () => {
    runAIGame();
});

function menu(){
    mainMenu.style.display = "block"
    playerLogin.style.display = "none";
    playerstatsPage.style.display = "none";
    gameScreen.style.display = "none";
    //gameResults.style.display = "none";
    menuButton.style.display = "none";
    restartButton.style.display = "none";
    gameSettings.style.display = "none";
}

socket.on('menu', (data) =>{
    mainMenu.style.display = "block"
    playerLogin.style.display = "none";
    playerstatsPage.style.display = "none";
    gameScreen.style.display = "none";
    //gameResults.style.display = "none";
    menuButton.style.display = "none";
    restartButton.style.display = "none";
    gameSettings.style.display = "none";
});

confirmButton.addEventListener('click', () => {
    if (userName.value.length == 0){

    }else {
        socket.emit('clientInfo', {playerName: userName.value.toLowerCase(), socketID: socket.io.engine.id, room: "null", colour: "null"});
    }
});

socket.on('disconecting', (data) => {
    playerCount = data
});

socket.on('startGame', (data) => {
    updateBoard(data);
    socket.emit('associateTurn', socket.io.engine.id) 
});

socket.on('assigned', (data) => {
    clientTurn = data
    console.log("this is the client turn", clientTurn)
    startGame();  
});

function startGame() { 
    mainMenu.style.display = "none"
    playerLogin.style.display = "none";
    playerstatsPage.style.display = "none";
    gameScreen.style.display = "block";
    //gameResults.style.display = "none";
    menuButton.style.display = "block";
    restartButton.style.display = "block";
    gameSettings.style.display = "none";
    row.forEach(cell => {
    cell.addEventListener('click', handleClick, {once: false})
    })
    setHoverClass()
}

function handleClick(e){
    const cell = e.target
    console.log("cell clicked")
    if(clientTurn == rTurn && gameOver == false){
        placePiece(cell, rTurn)
    } else {
        console.log("no")
    }
}

function placePiece(cell, currentClass){ 
    cell.classList.add(currentClass)
    socket.emit('placed', {client: socket.io.engine.id, class: currentClass, cell: $(cell).index()}, gamestate);  
}

socket.on('win', (data) => {
    playerWin(data);
});

socket.on('draw', (data) => {
    playerDraw();
});

function playerWin(origionalTurn){
    gameOver = true;
    //gameScreen.style.display = "none";
    document.body.style.backgroundColor = "#06D6A0";
    gameResults.style.display = "block";
    winningPlayer.style.display = "block";
    menuButton.style.display = "block";
    restartButton.style.display = "block";
    winningPlayer.textContent = origionalTurn + " wins!"
}

function playerDraw(){
    gameOver = true;
    //gameScreen.style.display = "none";
    document.body.style.backgroundColor = "#06D6A0";
    gameResults.style.display = "block";
    winningPlayer.style.display = "block";
    menuButton.style.display = "block";
    restartButton.style.display = "block";
    winningPlayer.textContent = "It is a draw!"
}

function setHoverClass(gamestate){
    gridElement.classList.remove(R_class)
    gridElement.classList.remove(Y_class)
    if (clientTurn == R_class){
        gridElement.classList.add(R_class)
    } else if (clientTurn == Y_class){
        gridElement.classList.add(Y_class)
    }
}

function checkDraw(){
    return drawingCombos.every(index => {
        return cellElement[index].classList.contains(R_class) || cellElement[index].classList.contains(Y_class)
        
    })
}

socket.on('placed', (data) => {
    updateBoard(data);
});

function updateBoard(gamestate){
   
    rTurn = gamestate.turn;
    origionalTurn = gamestate.origional;
    cellElement.forEach((cell, position) => {
            cell.classList.remove(R_class);
            cell.classList.remove(Y_class);
            if (gamestate.board[position] == R_class) {
                cell.classList.add(R_class);
            } else if (gamestate.board[position] == Y_class) {
                cell.classList.add(Y_class);
            }
    })
    if (gamestate.winner == "R" || gamestate.winner == "Y"){
        socket.emit('win', origionalTurn, socket.io.engine.id);  
    } else if(!(gamestate.winner == "R" || gamestate.winner == "Y")){
        if(checkDraw()){
            socket.emit('draw', socket.io.engine.id); 
        }
    }
    row.forEach(cell => {
        cell.removeEventListener('click', handleClick, {once: true})
        if(cell.classList.contains("R") || cell.classList.contains("Y")){

        } else {
            cell.addEventListener('click', handleClick, {once: true})
        }})
    socket.emit('updateGamestate', gamestate, socket.io.engine.id)
    setHoverClass(gamestate)
}

socket.on('gamestateUpdated', (data) =>{
    gamestate = data;
})

statsButton.addEventListener('click', () => {
    socket.emit('getFile', socket.io.engine.id)
});

function statsPage(lines){
    mainMenu.style.display = "none"
    playerLogin.style.display = "none";
    playerstatsPage.style.display = "block";
    gameScreen.style.display = "none";
    //gameResults.style.display = "none";
    menuButton.style.display = "block";
    restartButton.style.display = "none";
    gameSettings.style.display = "none";
    playerstatsName.innerHTML = "Name: " + userName.value 
    playerstatsWins.innerHTML = "Wins: " + lines[linearSearch(lines, userName.value.toLowerCase()) + 1];

    var players = []
    var wins = []
    if(lines.lenght == 1){
        //what to do if there are no wins so far
    }else{
        for( var i=1, len=lines.length - 1; i<len; i+=2 ){
            players.push(lines[i])
            wins.push(lines[i + 1])
        }
    }
    var xValues = players
    var yValues = wins
    var barColors = Array.apply(null, Array(5)).map(function () {})
    for( var i=0, len=barColors.length; i<len; ++i ){
        barColors[i] = getRandomColor()
    }

    new Chart("myChart", {
        type: "horizontalBar",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
                }]
            },
        options: {
            legend: {display: false},
            title: {
                display: true,
                text: "Player stats"  
            },
            scales: {
                xAxes: [{
                    gridLines: {
                    zeroLineColor: "black",
                    zeroLineWidth: 2
                    },
                    ticks: {
                    min: 0,
                    max: 20,
                    stepSize: 1
                    },
                    scaleLabel: {
                    display: true,
                    labelString: "Wins"
                    }
                }],
                yAxes: [{
                    gridLines: {
                    },
                    scaleLabel: {
                    display: true,
                    labelString: "Players"
                    }
                }]
            }
        }
    });
}

socket.on('returnFile', (lines) => {
    statsPage(lines)
})

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

function linearSearch(arr, key){
    for(let i = 0; i < arr.length; i++){
        if(arr[i] === key){
            return i
        }
    }
    return -1
}

//--------------------------------------------------------------------------------------------------------------------------//

function runAIGame(){
    mainMenu.style.display = "none"
    playerLogin.style.display = "none";
    playerstatsPage.style.display = "none";
    gameScreen.style.display = "block";
    //gameResults.style.display = "none";
    menuButton.style.display = "block";
    restartButton.style.display = "block";
    gameSettings.style.display = "none";
    playingAiGame = true;
    AIgamestate = [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "];
    
    cellElement.forEach((cell) => {
        cell.classList.remove(R_class);
        cell.classList.remove(Y_class);
    })
    row.forEach(cell => {
        cell.addEventListener('click', rPlaced, {once: false})
    })
    setAIHoverClass()
}

function setAIHoverClass(){
    gridElement.classList.remove(R_class)
    gridElement.classList.remove(Y_class)
    gridElement.classList.add(R_class)
}

function rPlaced(e){
    const cell = e.target  
    if(!(cell.classList.contains(R_class) || cell.classList.contains(Y_class)) && gameOver == false){
        placeRPiece(cell, R_class)
    } else {
    }
}

function placeRPiece(cell, R_class){
    cell.classList.add(R_class) 
    let data = $(cell).index() 
    let found = false
        for(let i = 0; i < 7; i++){
            if(found == false){
                if((AIgamestate[data + (i*7)] == "R") || (AIgamestate[data + (i*7)] == "Y")){
                    found = true
                    AIgamestate[(data + (i*7)) - 7] = R_class;
                } else if(i * 7 == 41){
                    AIgamestate[i] = R_class;
                } else if ((AIgamestate[data + (i*7)] == " ")){
                    if(data + (i*7) >= 35){
                        AIgamestate[data + (i*7)] = R_class;
                    } else if(data + (i*7) < 35){
                    }
                }
            } else if(found == true){

            }
        } 
        cellElement.forEach((cell, position) => {
            cell.classList.remove(R_class);
            cell.classList.remove(Y_class);
            if (AIgamestate[position] == R_class) {
                cell.classList.add(R_class);
            } else if (AIgamestate[position] == Y_class) {
                cell.classList.add(Y_class);
            }
        })
        if (checkWin(R_class, AIgamestate) == R_class){
            playerWin(R_class)
        }else if (checkWin(Y_class, AIgamestate) == Y_class){
            playerWin(Y_class)
        }else if (checkDraw()){
            playerDraw()
        }else{
            chooseAIplace(AIgamestate);
        }
}

function chooseAIplace(AIgamestate){
    let blankCell = " "
    let chosenPlace = false
    cellElement.forEach((cell, position) => {
        if(!chosenPlace && checkWin(R_class, AIgamestate) != R_class){
            if (AIgamestate[position] == R_class || AIgamestate[position] == Y_class){

            }else if (AIgamestate[position] == blankCell) {
                if (AIgamestate[position + 7] == R_class || AIgamestate[position + 7] == Y_class){
                    if (chosenPlace == false){    
                        cell.classList.add(Y_class);
                        AIgamestate[position] = Y_class;
                        if (checkWin(Y_class, AIgamestate) == Y_class){
                            chosenPlace = true
                        } else if(checkWin(Y_class, AIgamestate) != Y_class){
                            cell.classList.remove(Y_class);
                            AIgamestate[position] = blankCell
                            chosenPlace = false
                        }
                    }
                    if (chosenPlace == false){    
                        cell.classList.add(R_class);
                        AIgamestate[position] = R_class;
                        if (checkWin(R_class, AIgamestate) == R_class){
                            cell.classList.remove(R_class);
                            AIgamestate[position] = Y_class
                            cell.classList.add(Y_class);
                            chosenPlace = true
                        } else if(checkWin(R_class, AIgamestate) != R_class){
                            cell.classList.remove(R_class);
                            AIgamestate[position] = blankCell
                            chosenPlace = false
                        }
                    }
                }
            }
            if(position == 41 && chosenPlace == false){
                if(checkDraw()){
                
                }else{
                    do{
                        let randomPos = getRandomInt(42)
                        if (AIgamestate[randomPos] == blankCell) {

                            if(randomPos >=35){    
                                cellElement.forEach((cell, pos) => {
                                    if (pos == randomPos){
                                        cell.classList.add(Y_class);
                                        AIgamestate[pos] = Y_class
                                        chosenPlace = true
                                    } 
                                })
                            }else if(randomPos < 35){
                                if(AIgamestate[randomPos + 7] == R_class || AIgamestate[randomPos + 7] == Y_class){
                                    cellElement.forEach((cell, pos) => {
                                        if (pos == randomPos){
                                            cell.classList.add(Y_class);
                                            AIgamestate[pos] = Y_class
                                            chosenPlace = true
                                        } 
                                    })
                                }
                            }
                        } else {
                            
                        }
                    } while(!chosenPlace);
                }
            }
            
        } else{

        }
    });
    if (checkWin(R_class, AIgamestate) == R_class){
        playerWin(R_class)
    }else if (checkWin(Y_class, AIgamestate) == Y_class){
        playerWin(Y_class)
    }else if (checkDraw()){
        playerDraw()
    }else{
        
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
 
function checkWin(turn, AIgamestate){
    winner = ""
    //vertical
    for(let i = 0; i < 3; i++){
        for(let x = 0; x < 7; x++){
            if(AIgamestate[(i*7)+(x)] == turn){
                if(AIgamestate[(i*7)+(x) + 7] == turn){
                    if(AIgamestate[(i*7)+(x) + 14] == turn){
                        if(AIgamestate[(i*7)+(x) + 21] == turn){
                            winner = turn
                        }
                    }
                }
            }
        }
    } 
    //horisontal
    for(let i = 0; i < 6; i++){
        for(let x = 0; x < 5; x++){
            if(AIgamestate[((i*7) + x)] == turn){
                if(AIgamestate[((i*7) + x) + 1] == turn){
                    if(AIgamestate[((i*7) + x) + 2] == turn){
                        if(AIgamestate[((i*7) + x) + 3] == turn){
                            winner = turn
                        }
                    }
                }
            }
        }
    }
    //diagonal l2r down
    for(let i = 0; i < 4; i++){
        for(let x = 0; x < 3; x++){
            if(AIgamestate[(i) + (x*7)] == turn){
                if(AIgamestate[(i) + (((x + 1)*7) + 1)] == turn){
                    if(AIgamestate[(i) + (((x + 2)*7) + 2)] == turn){
                        if(AIgamestate[(i) + (((x + 3)*7) + 3)] == turn){
                            winner = turn
                        }
                    }
                }
            }
        }
    }
    //diagonal l2r up
    for(let i = 0; i < 4; i++){
        for(let x = 5; x > 2; x--){
            if(AIgamestate[(i) + (x*7)] == turn){
                if(AIgamestate[(i) + (((x - 1)*7) + 1)] == turn){
                    if(AIgamestate[(i) + (((x - 2)*7) + 2)] == turn){
                        if(AIgamestate[(i) + (((x - 3)*7) + 3)] == turn){
                            winner = turn
                        }
                    }
                }
            }
        }
    }
    return winner
}