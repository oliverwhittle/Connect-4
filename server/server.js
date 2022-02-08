const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const fs = require('fs');
const file = "public/textfiles/stats.txt"
const publicPath    = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
var total

var clients =[];
let origionalTurn
let assignedTurn
let winner = ""
let userWins = "0"
var userData = {name: "temp", wins: userWins }
var lines

app.use(express.static(publicPath));

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}.`)
});

io.on('connection', (socket) => {
    console.log('A user just connected.');
    
    socket.on('clientInfo', (data) =>{
        clients.push(data);
    io.to(socket.id).emit('menu');
    })

//this needs to be fixed
    socket.on('disconnect', (socket) => {
        console.log('A user has disconnected.');
        var total = io.engine.clientsCount
        io.emit('disconecting', total)
        for( var i=0, len=clients.length; i<len; ++i ){
            var clientSocket = clients[i].socketID;
            if(clientSocket == socket){
                clients.splice(i);
                break;
            }
        }
        console.log("Refreshed client list", clients);
    })

    function getRoomCode(client) {
        for (var i = 0; i < clients.length; i++){
            if (clients[i].socketID == client){
                return clients[i].room
            }
        }
    }

    socket.on('waitingRoom', (roomCode, socketIdentifier, gamestate) => {
        socket.join(roomCode);
        var clientsInRoom = []
        for (var i = 0; i < clients.length; i++){
            if (clients[i].socketID == socketIdentifier ){
                clients[i].room = roomCode
            }
        }
        for (var i = 0; i < clients.length; i++){
            if (clients[i].room == roomCode ){
                clientsInRoom.push(clients[i])
            }
        }
        while (clientsInRoom.length > 2){
            if (clientsInRoom.length > 2){
                clientsInRoom.pop()
                socket.leave(roomCode)
            }
        }
        console.log("Clients list", clients)
        total = io.engine.clientsCount
        
        io.to(roomCode).emit('startGame', gamestate, clientsInRoom.length);
    })

    socket.on('reloadGame', (socketIdentifier) => {
        var roomCode = getRoomCode(socketIdentifier)
    io.to(roomCode).emit("gameReloaded")
    })

    socket.on('gameRestart', (socketIdentifier, gamestate) => {
        var roomCode = getRoomCode(socketIdentifier)
    io.to(roomCode).emit("startGame", gamestate)
    })


    socket.on('quitGame', (data) => {
        var roomCode = getRoomCode(data)
    io.to(roomCode).emit("gameLeft", roomCode)
    })

    socket.on('allplayersLeave', (data) => {
        var roomCode = getRoomCode(data)
        socket.leave(roomCode)
    })

    socket.on('associateTurn', (data) => {
        var roomCode = getRoomCode(data)
        console.log("Room code", roomCode)
        var clientsInRoom = []
        for (var i = 0; i < clients.length; i++){
            if (clients[i].room == roomCode ){
                clientsInRoom.push(clients[i])
            }
        }

        if (clientsInRoom.length == 2){
            clientsInRoom[0].colour = "R"
            clientsInRoom[1].colour = "Y"
        }

        for (var i = 0; i < clients.length; i++){
            if (clients[i].socketID == clientsInRoom[0].socketID){
                clients[i].colour = clientsInRoom[0].colour
            }else if (clients[i].socketID == clientsInRoom[1].socketID){
                clients[i].colour = clientsInRoom[1].colour
            }
        }

        if(data == clientsInRoom[0].socketID){
            assignedTurn = clientsInRoom[0].colour
        } else if (data == clientsInRoom[1].socketID) {
            assignedTurn = clientsInRoom[1].colour
        }
        console.log("Assigned", assignedTurn)
    io.to(socket.id).emit("assigned", assignedTurn)
    })

    socket.on('placed', (data, gamestate) => { 
        var roomCode = getRoomCode(data.client)
        let found = false
        var winningPositions = [4];
        for(let i = 0; i < 7; i++){
            if(found == false){
                if((gamestate.board[data.cell + (i*7)] == "R") || (gamestate.board[data.cell + (i*7)] == "Y")){
                    found = true
                    gamestate.board[(data.cell + (i*7)) - 7] = data.class;
                } else if(i * 7 == 41){ // this willl eventualy be removed
                    gamestate.board[i] = data.class;
                } else if ((gamestate.board[data.cell + (i*7)] == " ")){
                    if(data.cell + (i*7) >= 35){
                        gamestate.board[data.cell + (i*7)] = data.class;
                    } else if(data.cell + (i*7) < 35){
                    }
                }
            } else if(found == true){
            }
        }

        //vertical
        winner = ""
        for(let i = 0; i < 3; i++){
            for(let x = 0; x < 7; x++){
                if(gamestate.board[(i*7)+(x)] == gamestate.turn){
                    if(gamestate.board[(i*7)+(x) + 7] == gamestate.turn){
                        if(gamestate.board[(i*7)+(x) + 14] == gamestate.turn){
                            if(gamestate.board[(i*7)+(x) + 21] == gamestate.turn){
                                winner = gamestate.turn
                                winningPositions[0] = (i*7)+(x);
                                winningPositions[1] = (i*7)+(x) + 7;
                                winningPositions[2] = (i*7)+(x) + 14;
                                winningPositions[3] = (i*7)+(x) + 21;
                            }
                        }
                    }
                }
            }
        } 
        //horisontal
        for(let i = 0; i < 6; i++){
            for(let x = 0; x < 4; x++){
                if(gamestate.board[((i*7) + x)] == gamestate.turn){
                    if(gamestate.board[((i*7) + x) + 1] == gamestate.turn){
                        if(gamestate.board[((i*7) + x) + 2] == gamestate.turn){
                            if(gamestate.board[((i*7) + x) + 3] == gamestate.turn){
                                winner = gamestate.turn
                                winningPositions[0] = ((i*7) + x);
                                winningPositions[1] = ((i*7) + x) + 1;
                                winningPositions[2] = ((i*7) + x) + 2;
                                winningPositions[3] = ((i*7) + x) + 3;
                            }
                        }
                    }
                }
            }
        }
        //diagonal l2r down
        for(let i = 0; i < 4; i++){
            for(let x = 0; x < 3; x++){
                if(gamestate.board[(i) + (x*7)] == gamestate.turn){
                    if(gamestate.board[(i) + (((x + 1)*7) + 1)] == gamestate.turn){
                        if(gamestate.board[(i) + (((x + 2)*7) + 2)] == gamestate.turn){
                            if(gamestate.board[(i) + (((x + 3)*7) + 3)] == gamestate.turn){
                                winner = gamestate.turn
                                winningPositions[0] = (i) + (x*7);
                                winningPositions[1] = (i) + (((x + 1)*7) + 1);
                                winningPositions[2] = (i) + (((x + 2)*7) + 2);
                                winningPositions[3] = (i) + (((x + 3)*7) + 3);
                            }
                        }
                    }
                }
            }
        }
        //diagonal l2r up
        for(let i = 0; i < 4; i++){
            for(let x = 5; x > 2; x--){
                if(gamestate.board[(i) + (x*7)] == gamestate.turn){
                    if(gamestate.board[(i) + (((x - 1)*7) + 1)] == gamestate.turn){
                        if(gamestate.board[(i) + (((x - 2)*7) + 2)] == gamestate.turn){
                            if(gamestate.board[(i) + (((x - 3)*7) + 3)] == gamestate.turn){
                                winner = gamestate.turn
                                winningPositions[0] = (i) + (x*7);
                                winningPositions[1] = (i) + (((x - 1)*7) + 1);
                                winningPositions[2] = (i) + (((x - 2)*7) + 2);
                                winningPositions[3] = (i) + (((x - 3)*7) + 3);
                            }
                        }
                    }
                }
            }
        }
        gamestate.winner = winner   
        var clientsInRoom = []
        for (var i = 0; i < clients.length; i++){
            if (clients[i].room == roomCode ){
                clientsInRoom.push(clients[i])
            }
        }
        console.log("data.client", data.client)
        console.log("clientsInRoom[0].socketID", clientsInRoom[0].socketID)
        console.log("clientsInRoom[1].socketID", clientsInRoom[1].socketID)
        console.log("gamestate.turn", gamestate.turn)
        if(data.client == clientsInRoom[0].socketID && gamestate.turn == "R"){
            origionalTurn = gamestate.turn
            gamestate.turn = "Y"
        } else if (data.client == clientsInRoom[1].socketID && gamestate.turn == "Y") {
            origionalTurn = gamestate.turn
            gamestate.turn = "R"
        }
        gamestate.origional = origionalTurn
    io.to(roomCode).emit('placed', gamestate, winningPositions);
    })

    socket.on('updateGamestate', (gamestate, socketIdentifier) => {
        var roomCode = getRoomCode(socketIdentifier)
        io.to(roomCode).emit('gamestateUpdated', gamestate)
    })
    
    socket.on('win', (data, socketIdentifier) => {
        var roomCode = getRoomCode(socketIdentifier)
        userData = {name: "temp", wins: userWins }
        lines = fs.readFileSync(file, 'utf-8').toString().split(",");
        var clientsInRoom = []
        for (var i = 0; i < clients.length; i++){
            if (clients[i].room == roomCode ){
                clientsInRoom.push(clients[i])
            }
        }
        for( var i=0, len=clientsInRoom.length; i<len; ++i ){
            var c = clientsInRoom[i].colour;
            if(c == data){
                userData.name = clientsInRoom[i].playerName
                if (clientsInRoom[i].socketID == socketIdentifier)
                    if(linearSearch(lines, userData.name) !== -1){
                        userData.wins = (parseFloat(lines[(linearSearch(lines, userData.name) + 1)]) + 1)
                        lines[linearSearch(lines, userData.name) + 1] = userData.wins
                    }else if(linearSearch(lines, userData.name) == -1){
                        userData.wins = 1
                        lines.push([userData.name, userData.wins])
                    }
            }else{
            }
        }
        fs.writeFileSync(file, lines.toString())
        lines = fs.readFileSync(file, 'utf-8').toString().split(",");
    io.to(roomCode).emit('win', data);
    })

    socket.on('getFile', (data) => {
        lines = fs.readFileSync(file, 'utf-8').toString().split(",");
        io.to(socket.id).emit('returnFile', lines);
    })
    
    socket.on('draw', (socketIdentifier) => {  
        var roomCode = getRoomCode(socketIdentifier)
    io.to(roomCode).emit('draw');
    })

    function linearSearch(arr, key){
        for(let i = 0; i < arr.length; i++){
            if(arr[i] === key){
                return i
            }
        }
        return -1
    }

    function getRnd(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
});