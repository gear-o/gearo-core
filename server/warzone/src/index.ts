// process.env.DEBUG="*"
import { Map as Game } from './game.js'
import * as SocketManager from "./socket_manager.js"
import * as Server from "socket.io"
import {v4 as uuidv4} from 'uuid';
import {Web3Custom} from './web3_custom'
const ethPrice = require('eth-price');

import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv'
dotenv.config({path:__dirname+'/../gearo.env'})

// TODO: 
// -block new incoming connexion on server for maintenance
// -count user & get location | push into environement var to print the var into a map of users all around the world
// -join parties by type free, 1$, 5$, 50$
// -wait for 10 user or launch parties after a 10 second of waiting if there is more than one player
// -network, infura keyid, from may not be inside of code but in process env var
let web3 = new Web3Custom();
let version = "1.0.1";
let blockedVersion:Array<string> = ["0.0.1"];

export class App{
killed = false;
payed:number = 0;
maintenanceTimer:NodeJS.Timer = setInterval(()=>{});
maintenaceCount = 0;
nbOfUser = 0;
maxNbOfUser = 100;
maxUserMsg = "max of user reach on the game, we are testing server capacity by increasing max number of user";

promo: Array<String> = [];
promo1: Array<String> = [];
promo5: Array<String> = [];
promo10: Array<String> = [];
promo50: Array<String> = [];

games: Array<Game> = [];
games1: Array<Game> = [];
games5: Array<Game> = [];
games10: Array<Game> = [];
games50: Array<Game> = [];

io:Server.Server;

whichGame(partyType:number){
    let err = false;
    let game = this.games;
    switch(partyType){
        case 0:{
            game = this.games;
            break;
        }
        case 1:{
            game = this.games1;
            break;
        }
        case 5:{
            game = this.games5;
            break;
        }
        case 10:{
            game = this.games10;
            break;
        }
        case 50:{
            game = this.games50;
            break;
        }
        default:{
            err = true
            // TODO: crackers
        }
    }
    return game;
}

whichPromo(partyType:number){
    let err = false;
    let promo = this.promo;
    switch(partyType){
        case 1:{
            promo = this.promo1;
            break;
        }
        case 5:{
            promo = this.promo5;
            break;
        }
        case 10:{
            promo = this.promo10;
            break;
        }
        case 50:{
            promo = this.promo50;
            break;
        }
        default:{
            err = true
            // TODO: crackers
        }
    }
    return promo;
}

constructor(){
    // create server

    const app = express();
const server = app.listen(3000);
this.io = new Server.Server<SocketManager.ClientToServerEvents, SocketManager.ServerToClientEvents, SocketManager.InterServerEvents>(server);

const corsOptions = {
  origin: 'https://example.com', // Remplacez par le site en question
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));



    //this.io = new Server.Server<SocketManager.ClientToServerEvents, SocketManager.ServerToClientEvents, SocketManager.InterServerEvents>();
    //this.io.listen(3000)

    // listen for all connexion on server
    this.io.on('connection', socket => {
        /******************
         * game to server *
         ******************/
         socket.on('reconnection', (roomName, gameId, partyType) => {
            let games = this.whichGame(partyType);
            let index = games.findIndex(game => game.roomGame == roomName);
            if(index != -1){
                socket.join(games[index].roomClients);
            }else{
                // send game over unknown info disconnect
                socket.emit('gameOver', gameId, 'unknown infos because of diconnection');
            }
        })
        socket.on('joinRoom', (roomName) => {
            socket.join(roomName);
        })
        socket.on('sendMap', (roomClients, map) => {
            this.io.to(roomClients).emit('sendMap', map);
        })
        socket.on('gameOver', (roomClients, id, infos) => {
            console.log("gameover =", id, " infos = ", infos );
            this.io.to(id).emit('gameOver', infos);
            socket.leave(roomClients);
        })
        socket.on('endGame', (roomName, partyType)=>{
            // socket._cleanup;
            // socket.removeListener;
            // find in games the game with roomname
            let game = this.whichGame(partyType);
            console.log("endGame");
            // let index = this.games.findIndex(game => game.roomGame == roomName);
            for(let i=game.length; i != 0 ; i--){
                if(game[i]?.roomGame == roomName){
                    socket.in(roomName).socketsLeave(roomName);
                    socket.in(game[i]?.roomClients).socketsLeave(game[i]?.roomClients);
                    game[i].killGame();
                    // delete game[i];
                    game.splice(i,1);
                    // BUG: for some reason if break missing infinite loop
                    break;
                }
            }
        })
        socket.on('joinAll', (allSocket, roomGame, roomClient, gameType, nbOfUsers) => {
            if(gameType > 0){
                this.payed+=(gameType*nbOfUsers);
            }
            for(let i = 0; i != allSocket.length; i++){
                console.log(i, " | send to socket =", allSocket[i][0], " with id =", allSocket[i][1]);
                this.io.to(allSocket[i][0]).emit('gameId', allSocket[i][1]);
                console.log('room game: ', roomGame, ' room client: ', roomClient)
                this.io.sockets.sockets.get(allSocket[i][0])?.join(roomGame);
                this.io.sockets.sockets.get(allSocket[i][0])?.join(roomClient);
                // emit enter in game
                this.io.to(roomClient).emit('enterGame');
                this.nbOfUser++;
            }
        })
        socket.on('gameRoom', (socket:string, roomName:string) => {
            this.io.to(socket).emit('gameRoom', roomName);
        })
        socket.on('nbOfUsr', (allSocket, connected:number, confirmed:number) => {
            console.log("to room: ", allSocket, " nb: ", connected, " ", confirmed)
            for(let i = 0; i != allSocket.length; i++){
                this.io.to(allSocket[i][0]).emit('nbOfUsr', connected, confirmed);
            }
        })
        socket.on('walletConnect', (socket:string, url:string) => {
            console.log('walletConnect')
            this.io.to(socket).emit('walletConnect', url);
        })
        socket.on('err', (socket, err:string) => {
            this.io.to(socket).emit('err', err);
        })
        socket.on('connected', (socket:string, roomGame:string) => {
            console.log('connected')
            this.io.to(socket).emit('connected', roomGame);
        })
        socket.on('confirmed', (socket:string) => {
            console.log('confirmed')
            this.io.to(socket).emit('confirmed');
        })
        socket.on('whoIsU', (socket:string, map:number) => {
            this.io.to(socket).emit('whoIsU', map);
        })
        socket.on('gameInfo', (roomClients:string, info:string) => {
            this.io.to(roomClients).emit('gameInfo', info);
        })
        /*********************
         * clients to server *
         *********************/
        socket.on('join', (id, walletId, promocode:string, partyType, name, logo, gameVersion) => {
            let versionNotSupported = (blockedVersion.indexOf(gameVersion) >= 0);
            if(!this.killed && !versionNotSupported && this.nbOfUser < this.maxNbOfUser){
                let game = this.whichGame(Number(partyType));
                if(!game[game.length-1]?.available() || game.length == 0){
                    // create new game
                    console.log("create new game")
                    let newGame = new Game(uuidv4(), uuidv4(), partyType);
                    game.push(newGame);
                }
                let promo = this.whichPromo(Number(partyType));
                console.log("promocode: ", promocode);
                console.log(promo)
                if(promo.includes(promocode) && promocode){
                    // enter in game without paying
                    console.log('enter with promocode');
                    promo.forEach((element,index)=>{
                        if(element==promocode) promo.splice(index,1);
                    });
                    game[game.length-1]?.joinGame(socket.id, id, name, "o", true);
                }else{
                    game[game.length-1]?.joinGame(socket.id, id, name, "o", false);
                }
            }else if(this.killed){
                socket.emit('maintenance', this.maintenaceCount);
            }else if(versionNotSupported){
                socket.emit('version', version);
            }else if(this.nbOfUser >= this.maxNbOfUser){
                socket.emit('maxUserReach', this.maxUserMsg);
            }
        })
        socket.on('move', (id, keyname, roomName) => {
            this.io.to(roomName).emit('move', id, keyname);
        })
        socket.on('shoot', (id, roomName) => {
            this.io.to(roomName).emit('shoot', id);
        })
        socket.on('disconnect', () => {
            // socket._cleanup;
            // socket.removeListener;
        })
        socket.on('quitGame', (roomName) => {
            console.log('server quit game : ', roomName, ' socket: ', socket.id)
            this.io.to(roomName).emit('quitGame', socket.id);
            //this.io.in(roomName).socketsLeave(socket.id);
        })
        socket.on('version', (versionCli) => {
            socket.emit("version", version);
        })
        // use for later
        socket.on('disconnected', (roomName) => {
        })
        /**********************
         * sentinel to server *
         **********************/
        socket.on('gameNB', () => {
            // console.log("server killed status="+this.killed.toString()+"\nfree game="+this.games.length+"\ngame1="+this.games1.length+"\ngame5"+this.games5.length+"\ngame10="+this.games10.length+"\ngame50="+this.games50.length)
            socket.emit('gameNB', "server killed status="+this.killed.toString()+"\nfree game="+this.games.length+"\ngame1="+this.games1.length+"\ngame5"+this.games5.length+"\ngame10="+this.games10.length+"\ngame50="+this.games50.length);
        })
        socket.on('gameNBUser', () => {
            // console.log("server killed status="+this.killed.toString()+"\nfree game="+this.games.length+"\ngame1="+this.games1.length+"\ngame5"+this.games5.length+"\ngame10="+this.games10.length+"\ngame50="+this.games50.length)
            socket.emit('gameNBUser', this.nbOfUser);
        })
        socket.on('killServer', (count:number) => {
            console.log("kill")
            this.killed =true;
            this.maintenaceCount = count;
            clearInterval(this.maintenanceTimer);
            this.maintenanceTimer = setInterval(()=>{this.maintenaceCount--}, 1000)
        })
        socket.on('launchServer', () => {
            console.log("launch")
            this.killed = false;
        })
        socket.on('salary', () =>{
            web3.web3.eth.getBalance(web3.from).then((value) =>{
                value = web3.web3.utils.fromWei(value);
                ethPrice('usd,eth').then((ethInfo:any) => {
                    ethInfo = ethInfo[0].replace('USD: ','')
                    let salary = (Number(ethInfo)*Number(value)) - this.payed;
                    console.log(salary)
                    socket.emit('salary', salary)
                });
            });
        });
        socket.on('setMaxOfUser', (max:number, msg:string) => {
            console.log(max);
            console.log(msg);
            this.maxNbOfUser = max;
            this.maxUserMsg = msg;
        })
        socket.on('promocodegen', (partyType:number, nb:number) => {
            let promo = this.whichPromo(partyType)
            for(let i=0; i != nb; i++){
                promo.push(uuidv4());
            }
            console.log(promo)
            socket.emit('promocode', promo);
        })
        socket.on('promocode', (partyType:number) => {
            let promo = this.whichPromo(partyType)
            socket.emit('promocode', promo);
        })
        /**************
         * PROTECTION *
         **************/
        socket.onAny((event, data) => {
            // TODO: if event not in the list, getting attacked
            // if(event){
            //     console.log("event:", event);
            //     console.log("data:", data);
            // }
        })
    });
} // constructor
} // class

new App()