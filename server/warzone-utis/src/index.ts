import {Socket} from 'socket.io-client'
import {io} from "socket.io-client"
import * as SocketManager from "./socket_manager.js"
import dotenv from 'dotenv'
dotenv.config({path:__dirname+'/../gearo.env'})

type NewType = SocketManager.ServerToClientEvents;

let server = process.env.SERVER_ADDR;

if(!server){
    server = "http://localhost:3000"
}

let socket : Socket<NewType, SocketManager.ClientToServerEvents> = io(server);

let gameId = 0;
let salary = 0;
let nbOfUser = 0;
let codes:Array<String>;

function help() {
    console.log(`warzone-util usage:
    -k or kill
    -l or launch
    -g or gamenb
    -n or nbofuser
    -s or salary
    -max or setmaxuser
    -pgen or promocodegen
    -p or promocode`);
}

if (process.argv.length === 1) {
    console.error('Expected at least one argument!');
    help();
    process.exit(1);
}

if(process.argv[2] == 'kill' || process.argv[2] == '-k'){
    socket.emit('killServer', 10000);
    setTimeout(()=>{
        process.exit(1);
    }, 2000);
}else if(process.argv[2] == 'launch' || process.argv[2] == '-l'){
    setTimeout(()=>{
        socket.emit('launchServer');
        process.exit(1);
    }, 2000);
}else if(process.argv[2] == 'gamenb' || process.argv[2] == '-g'){
    setInterval(()=>{
        socket.emit('gameNB');
        console.log(gameId);
    }, 2000)
}else if(process.argv[2] == 'nbofuser' || process.argv[2] == '-n'){
    setInterval(()=>{
        socket.emit('nbOfUser');
        console.log(nbOfUser);
    }, 2000)
}else if(process.argv[2] == 'salary' || process.argv[2] == '-s'){
    setInterval(()=>{
        socket.emit('salary');
        console.log(salary);
    }, 2000);
}else if(process.argv[2] == 'setmaxuser' || process.argv[2] == '-max'){
    console.log(process.argv.length)
    if(process.argv.length == 5){
        socket.emit('setMaxOfUser', Number(process.argv[3]), process.argv[4]);
        setTimeout(()=>{
            process.exit(1);
        }, 2000);
    }else{
        console.log(`option setMaxUser require 2 args \
        -maxUser ex: 100\
        -msgToUser ex: max user reach`);
        process.exit(1);
    }
}else if(process.argv[2] == 'promocodegen' || process.argv[2] == '-pgen'){
    if(process.argv.length == 5){
        socket.emit('promocodegen', Number(process.argv[3]), Number(process.argv[4]));
        setInterval(()=>{
            if(codes){
                console.log('promo codes: ');
                console.log(codes);
                process.exit(1);
            }
        }, 2000);
    }else{
        console.log(`option promocodegen require 2 args \
        -party type ex: 1, 5, 10 ...\
        -nb of code to gen ex: 5, 10, 100`);
        process.exit(1);
    }
}else if(process.argv[2] == 'promocode' || process.argv[2] == '-p'){
    if(process.argv.length == 4){
        socket.emit('promocode', Number(process.argv[3]));
        setInterval(()=>{
            console.log(`promo codes: `);
            console.log(codes);
        }, 2000);
    }else{
        console.log(`option promocode require 1 arg
        partyType: 1, 5, 10 ...`);
        process.exit(1);
    }
}else if(process.argv[2] == 'help' || process.argv[2] == '-h'){
    console.log(`usage: warzone-utils HELP
    -k or kill: kill server
    -l or launch: launch server
    -g or gamenb: get number of parties on the server
    -n or nbofuser: get number of user
    -s or salary: get how much the game win on the specific server server
    -max or setmaxuser: set max of user can join the game and send a message to those who cannot join
    -pgen or promocodegen: generate promocode for game
    -p or promocode: see all promocode available on game
    `);
    process.exit(1);
}else{
    help();
    process.exit(1);
}

socket.onAny((eventName, data)=> {
    switch(eventName){
        case "gameNB":{
            gameId = data;
            break;
        }
        case "salary":{
            salary = data;
            break;
        }
        case "nbOfUser":{
            nbOfUser = data;
            break;
        }
        case "promocode":{
            codes = data;
            break;
        }
    }
});
