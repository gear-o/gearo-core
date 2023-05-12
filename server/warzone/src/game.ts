import * as itemts from "./artifact.js"
import {Character} from "./character.js"
import * as utils from "./utils.js"
//socket/
import * as SocketManager from "./socket_manager.js"
import {Socket} from "socket.io-client"
import {io} from "socket.io-client"
import {Web3Custom} from './web3_custom'
import Web3 from 'web3';
import {Contract} from 'web3-eth-contract';
import { Tx } from "./tx.js"
const ethPrice = require('eth-price');
import {IPlayerObserver} from "./playerObserver.js"
const solc = require("solc");
import fs from "fs";
import path from "path"
import { AbiItem } from "web3-utils"

export function add(){return 1}

export class Map implements IPlayerObserver{
    width = 128
    heigth = 36
    buffer: Array<string> = [];
    items = new Array<itemts.Artifact>()
    characters = new Array<Character>()
    bullets = new Array<Character>()
    started=false;
    fire=false;
    prestarted=false;
    socket : Socket<SocketManager.ServerToClientEvents, SocketManager.ClientToServerEvents> = io("http://localhost:3000");
    roomGame = "";
    roomClients = "";
    addRandomItem:NodeJS.Timer;
    updateBuffer:NodeJS.Timer;
    connectUsersTimer:NodeJS.Timeout;
    confirmUsersTimer:NodeJS.Timeout;
    timeUpTimer:NodeJS.Timeout;
    gameType;
    gamePriceWei:number = 0;
    allSockets:Array<[string, string]> = [];
    connectedSockets:Array<string> = [];
    confirmedSockets:Array<string> = [];
    minPlayers = 2;
    maxPlayers = 8;
    fees = 10;
    web3 = new Web3();
    web3Custom = new Web3Custom();
    contract:Contract;
    // TODO:
    // -shrunk the map
    // -delete part of the wall to let characters & bullet appear the other side and shoot by the hole
    // -random color for the user
    // -sending new version is available if version of user < last version
    /*******
     * MAP *
     *******/
    constructor(roomGame:string, roomClients:string, gameType:number){
        console.log('create game')
        this.socket.connect();
        this.roomClients = roomClients;
        this.roomGame = roomGame;
        this.gameType = gameType;
        this.newGame();
        this.socket.emit('joinRoom', roomGame);
        this.socket.on('move', (id:string, keyname:string) =>{
            if(this.started){
                this.moveUser(id, keyname)
            }
        });
        this.socket.on('shoot', (id:string) =>{
            if(this.fire){
                this.shoot(id);
            }
        });
        this.socket.on('quitGame', (socketId:string) =>{
            console.log('quitting game : ', this.roomGame, ' socket: ', socketId)
            console.log('all sockets: ', this.allSockets)
            console.log('connected: ', this.connectedSockets)
            console.log('confirmed: ', this.confirmedSockets)
            this.deleteUser(socketId);
            console.log('nb of user after quitting game ', this.connectedSockets.length, ' ', this.confirmedSockets.length, ' ', this.allSockets.length)
            this.socket.emit('nbOfUsr', this.allSockets, this.connectedSockets.length, this.confirmedSockets.length);            // leave de the client room
        });
        this.addRandomItem = setInterval(() => {
            if(this.started){
                this.addItem(
                    utils.randomInteger(utils.getMinMaxOfEnum(itemts.Type)[1] - utils.getMinMaxOfEnum(itemts.Type)[0],utils.getMinMaxOfEnum(itemts.Type)[0]),
                    utils.randomInteger(this.width-2, 2),
                    utils.randomInteger(this.heigth-2, 2)
                )
            }
        }, 5000);

        this.updateBuffer = setInterval(() => {
            if(this.started){
                this.tick()
            }
        }, 1000);
        this.connectUsersTimer = setTimeout(() => {}, 5000);
        this.confirmUsersTimer = setTimeout(() => {}, 5000);
        this.timeUpTimer = setTimeout(() => {}, 100000);

        // initialize empty contract
        const emptyContract = path.resolve(__dirname, "../contracts", "empty.sol")
        const emptyFile = fs.readFileSync(emptyContract).toString();
        console.log(emptyFile)
        let emptyInput = {
            language: "Solidity",
            sources: {
                "empty.sol": {
                    content: emptyFile,
                },
            },
            settings: {
                outputSelection: {
                    "*": {
                        "*": ["*"],
                    },
                },
            },
        };
        let output = JSON.parse(solc.compile(JSON.stringify(emptyInput)));
        let fakeABI = output.contracts["empty.sol"]["empty"].abi;
        this.contract = new this.web3Custom.web3.eth.Contract(fakeABI);

        // create smart contract
        if(gameType != 0){
            this.deploySC();
        }
    }
    available(){
        if(this.allSockets.length >= this.maxPlayers || this.started == true){
            return false;
        }else{
            return true;
        }
    }
    newGame(){
        for(let i=0; i<=this.heigth; i++){
            this.buffer[i] = ""
            for(let j=0; j<=this.width; j++){
                if(i==0 || j==0 || i==this.heigth || j==this.width){
                    this.buffer[i] = this.buffer[i].concat('X')
                }
                else{
                    this.buffer[i] = this.buffer[i].concat(' ')
                }
                if(this.buffer[i].length == this.width+1 && i != this.heigth){
                    this.buffer[i] = this.buffer[i].concat('\n')
                    break
                }
            }
        }
    }
    tick() {
        // DEBUG:
        // console.clear();
        // process.stdout.write(this.buffer.join(''))
        if(this.started){
            this.socket.emit('sendMap', this.roomClients, this.buffer.join(''));
        }
    }
    startGame() {
        console.log('started game: ', this.allSockets.length)
        this.started = true;
        let blinkNb = 0;
        let blinkTempo = false;
        let holdFireLeft = 10;
        let holdFire = setInterval(() => {
            this.socket.emit('gameInfo', this.roomClients, 'Hole fire ' + holdFireLeft.toString() + ' left');
            if(holdFireLeft == 0){
                this.socket.emit('gameInfo', this.roomClients, ' fire !!!!!!!!!');
                this.fire = true;
                clearInterval(holdFire);
            }
            holdFireLeft--;
        }, 1000)
        this.timeUpTimer = setTimeout(() => {
            for(let i = this.characters.length-1; i >= 0; i--){
                this.quitGame(this.characters[i].id);
            }
            this.socket.emit('endGame', this.roomGame);
        }, 100000);
        for(let i=0; i != this.characters.length; i++){
            if(this.characters[i]){
                this.showCharacter(this.characters[i].id);
            }
        }
        let blink = setInterval(() => {
            if(blinkNb < 60){
                for(let i=0; i != this.characters.length; i++){
                    let blinkMap = [...this.buffer]
                    if(blinkTempo){
                        blinkMap[this.characters[i].y] = utils.replaceAt(blinkMap[this.characters[i].y], this.characters[i].x, ' ')
                    }else{
                        blinkMap[this.characters[i].y] = utils.replaceAt(blinkMap[this.characters[i].y], this.characters[i].x, this.characters[i].logo)
                    }
                    this.socket.emit('whoIsU', this.characters[i].socket, blinkMap.join(''));
                }
                blinkNb++;
                blinkTempo = !blinkTempo;
            }else{
                clearInterval(blink);
            }
        }, 100)
    }
    killGame(){
        console.log("kill game")
        this.socket.close();
        this.started = false;
        clearInterval(this.addRandomItem);
        clearInterval(this.updateBuffer);
    }
    prepareGame(){
        if((this.connectedSockets.length + this.confirmedSockets.length) >= this.minPlayers){
            this.prestarted = true;
            this.connectUsersTimer = setTimeout(() => {
                console.log('nb of user connected ', this.connectedSockets.length, ' ', this.confirmedSockets.length, ' ', this.allSockets.length)
                console.log('all sockets: ', this.allSockets)
                console.log('connected: ', this.connectedSockets)
                console.log('confirmed: ', this.confirmedSockets)
                console.log('players array length: ', this.characters.length);
                for(let i=0; i != this.characters.length; i++){
                    console.log('player: ', this.characters[i].socket, ' connected: ', this.characters[i].connected, ' confirmed: ', this.characters[i].confirmed)
                    if(this.characters[i] && !this.characters[i].confirmed){
                        console.log('player enter in game: ', this.characters[i].socket, ' connected: ', this.characters[i].connected, ' confirmed: ', this.characters[i].confirmed)
                        this.characters[i].enterGame(this.contract, this.gamePriceWei);
                    }
                }
                // pay the game
                this.confirmUsersTimer = setTimeout(() => {
                    console.log('nb of user confirmed ', this.connectedSockets.length, ' ', this.confirmedSockets.length, ' ', this.allSockets.length)
                    for(let i = 0; i != this.characters.length; i++){
                        if(this.characters[i]){
                            if(!this.characters[i].enterConfirmed()){
                                // this.quitGame(this.characters[i]?.id);
                                this.deleteUser(this.characters[i]?.id);
                                console.log('not confirmed user ', this.connectedSockets.length);
                            }
                        }
                    }
                    console.log('nb of user on game before start ', this.connectedSockets.length, ' ', this.confirmedSockets.length, ' ', this.allSockets.length)
                    if(this.confirmedSockets.length < this.minPlayers){
                        // TODO:
                        // redirect user to another room
                        console.log('redirect to another room: ', this.connectedSockets.length, ' ', this.confirmedSockets.length, ' ', this.allSockets.length)
                        this.prestarted = false;
                        return;
                    }else{
                        this.socket.emit('joinAll', this.allSockets, this.roomGame, this.roomClients, this.gameType, this.allSockets.length);
                        this.startGame();
                    }
                }, 5000);
            }, 5000);
        }
    }
    joinGame(socket:string, id:number, name:string, logo:string, promo:boolean){
        let gameId = utils.randomInteger(10000-1, 1);
        console.log('game type: ', this.gameType);
        // TODO :
        // -check if socket already register, if yes return and do not proceed
        console.log('try to connect ', socket)
        console.log('list all socket connected ', this.allSockets)
        console.log('perso socket find = ', this.characters.findIndex(user => user.socket == socket))
        if(this.characters.findIndex(user => user.socket == socket) != -1){
            console.log(socket, 'already connected');
            return;
        }
        console.log('connected socket: ', socket);
        this.addCharacter(socket, gameId.toString(), id, name, logo, promo);
        this.allSockets.push([socket, gameId.toString()])
        this.socket.emit('gameRoom', socket, this.roomGame);
        this.socket.emit('nbOfUsr', this.allSockets, this.connectedSockets.length, this.confirmedSockets.length);
        console.log("number of users waiting = ", this.characters.length)
        // TODO:
        // -up to 3 or 5 users connected to optimise if one cannot pay
        console.log('game prestarted ? ', this.prestarted)
        if(this.connectedSockets.length + this.confirmedSockets.length >= 2 && !this.prestarted){
            setTimeout(() => {
                console.log('prepare game')
                this.prepareGame();
            }, 5000);
        }else{
            console.log('game already started')
        }
        return;
    }
    /**********
     * BULLET *
     **********/
    shoot(id:string){
        if(id){
            var characterIndex = this.characters.findIndex((perso => perso.id == id));
            // TODO: on maintain key 's' shot restriction do not work well
            if(this.characters[characterIndex]?.shotLeft >= 0){
                this.characters[characterIndex]?.shot();
                this.addBullet(id, this.characters[characterIndex]?.x, this.characters[characterIndex]?.y, this.characters[characterIndex]?.direction, 200);
            }
        }
    }
    addBullet(id:string, x:number, y:number, direction:utils.Direction, speed:number){
        let tot_x = Number(utils.moveBulletUtils(direction)[0]);
        let tot_y = Number(utils.moveBulletUtils(direction)[1]);
        let bullet_char = utils.moveBulletUtils(direction)[2].toString();
        let tmp_x = x + tot_x;
        let tmp_y = y + tot_y;
        if(this.buffer[tmp_y].charAt(tmp_x) != 'X'){
            this.buffer[tmp_y] = utils.replaceAt(this.buffer[tmp_y], tmp_x, bullet_char);
            var moveBullet = setInterval(() => {
                if(this.buffer[tmp_y+tot_y].charAt(tmp_x+tot_x) == ' '){
                    this.buffer[tmp_y] = utils.replaceAt(this.buffer[tmp_y], tmp_x, ' ');
                    tmp_y+=tot_y;
                    tmp_x+=tot_x;
                    this.buffer[tmp_y] = utils.replaceAt(this.buffer[tmp_y], tmp_x, bullet_char)
                    this.tick();
                }else{
                    if(this.buffer[tmp_y+tot_y].charAt(tmp_x+tot_x) == 'o'){
                        // kill person
                        // this.buffer[tmp_y] = utils.replaceAt(this.buffer[tmp_y], tmp_x, ' ');
                        let killed_info = this.quitGameByCoordinate(tmp_x+tot_x, tmp_y+tot_y);
                        if(killed_info[0] != id){
                            let index = this.characters.findIndex(user => user.id == id);
                            let playerWin = this.characters[index];
                            playerWin.killed_people_nb++;
                            this.sendCrypto(index, this.gamePriceWei);
                            playerWin.killed_people.push(killed_info);
                        }
                        if(this.characters.length < 2){
                            setTimeout(()=>{
                                console.log('kill perso: ', this.characters[0]?.id)
                                this.quitGame(this.characters[0]?.id);
                                this.socket.emit('endGame', this.roomGame);
                            },1000)
                        }
                    }
                    this.buffer[tmp_y] = utils.replaceAt(this.buffer[tmp_y], tmp_x, ' ');
                    clearInterval(moveBullet);
                }
            }, speed);
        }
        this.tick();
    }

    /*************
     * CHARACTER *
     *************/
    addCharacter(socket:string, id:string, serverId:number, name:string, logo:string, promo:boolean){
        // TODO:
        // -make teams be face to face or make users appear everywhere in the map
        let x = utils.randomInteger(this.width-2, 2);
        let y = utils.randomInteger(this.heigth-2, 2);
        let perso = new Character(socket, id, serverId, promo, name, logo, x, y, 3)
        perso.attach(this);
        perso.gameConnect(this.gameType);
        this.characters.push(perso);
        console.log('character ', perso.socket, ' added !')
    }

    showCharacter(gameId:string){
        console.log("showing player")
        // add character to map only on game pay
        let idx = this.characters.findIndex((perso => perso.id == gameId));
        let playerShown = this.characters[idx];
        this.buffer[playerShown.y] = utils.replaceAt(this.buffer[playerShown.y], playerShown.x, playerShown.logo)
        this.tick();
    }

    moveUser(id:string, keyname:string){
       if(id){
            let characterIndex = this.characters.findIndex((perso => perso.id == id));
            let tot_x = Number(utils.moveUserUtils(keyname)[0]);
            let tot_y = Number(utils.moveUserUtils(keyname)[1]);
            this.buffer[this.characters[characterIndex]?.y] = utils.replaceAt(this.buffer[this.characters[characterIndex]?.y], this.characters[characterIndex]?.x, ' ');
            if(!['X', 'o', '-', '\''].includes(this.buffer[this.characters[characterIndex]?.y+tot_y].charAt(this.characters[characterIndex]?.x+tot_x))){
                this.characters[characterIndex].y+=tot_y;
                this.characters[characterIndex].x+=tot_x;
            }
            this.characters[characterIndex].direction = utils.numberToDirection(utils.moveUserUtils(keyname)[2]);

            if(['-', '\''].includes(this.buffer[this.characters[characterIndex]?.y].charAt(this.characters[characterIndex]?.x))){
                // use to kill player, maybe we use it later as a feature
                return;
            }
            else if(this.buffer[this.characters[characterIndex]?.y].charAt(this.characters[characterIndex]?.x) == ' '){
                // do nothing continue
            }else if(this.buffer[this.characters[characterIndex]?.y].charAt(this.characters[characterIndex]?.x) == 'o'){
                //TODO: get bonus of kill
                // kill people by cut
            }else{
                this.takeItem(id, this.buffer[this.characters[characterIndex]?.y].charAt(this.characters[characterIndex]?.x))
            }
            this.buffer[this.characters[characterIndex]?.y] = utils.replaceAt(this.buffer[this.characters[characterIndex]?.y], this.characters[characterIndex]?.x, this.characters[characterIndex]?.logo)
            this.tick();
        }
    }

    quitGameByCoordinate(x:number, y:number){
        let killed_info:Array<string> = [];
        let i = this.characters.findIndex(user => (user.x == x && user.y == y));
        killed_info = [this.characters[i].id, this.characters[i].name];
        console.log("kill by coordinate ", this.characters[i].id);
        this.quitGame(this.characters[i]?.id);
        return killed_info;
    }
    quitGame(id:string){
        this.characters.forEach((element,index)=>{
            if(element.id ==id) {
                this.buffer[this.characters[index].y] = utils.replaceAt(this.buffer[this.characters[index].y], this.characters[index].x, ' ');
                // create json tx and send it in gameOver
                // let json = this.characters[index].txToJson();
                this.socket.emit('gameOver', this.roomClients, this.characters[index].socket, this.characters[index].info());
                this.characters.splice(index,1);
            }
        });
    }
    deleteUser(socketId:string){
        // if(!this.characters[indexC].confirmed){
            this.connectedSockets.forEach((element,index)=>{
                if(element==socketId) this.connectedSockets.splice(index,1);
            });
            this.confirmedSockets.forEach((element,index)=>{
                if(element==socketId) this.confirmedSockets.splice(index,1);
            });
            this.allSockets.forEach((element,index)=>{
                if(element[0]==socketId) this.allSockets.splice(index,1);
            });
            this.characters.forEach((element,index)=>{
                if(element.socket==socketId) this.characters.splice(index,1);
            });
            if(this.allSockets.length < this.minPlayers){
                // clearTimeout(this.confirmUsersTimer);
                clearTimeout(this.connectUsersTimer);
                this.started = false;
                this.prestarted = false;
            }
        // }
    }
    deploySC(){
        try{
            ethPrice('usd,eth').then((ethInfo:any)=>{
                ethInfo = ethInfo[0].replace('USD: ','')
                console.log("eth price: ", ethInfo);
                let ethAmount = (this.gameType/Number(ethInfo)).toFixed(15).toString();
                console.log("amount = ", ethAmount);
                this.gamePriceWei = Number(this.web3.utils.toWei(ethAmount, 'ether'));
                this.web3Custom.web3.eth.getBalance(this.web3Custom.from).then((balance) =>{
                    balance = this.web3.utils.fromWei(balance);
                    const freeforallContract = path.resolve(__dirname, "../contracts", "freeforall.sol")
                    console.log(freeforallContract)
                    const freeforallFile = fs.readFileSync(freeforallContract).toString();
                    console.log(freeforallFile)
                    let freeforallInput = {
                        language: "Solidity",
                        sources: {
                            "freeforall.sol": {
                                content: freeforallFile,
                            },
                        },
                        settings: {
                            outputSelection: {
                                "*": {
                                    "*": ["*"],
                                },
                            },
                        },
                    };
                    var output = JSON.parse(solc.compile(JSON.stringify(freeforallInput)));
                    console.log('contract compile: ', output)
                    let ABI = output.contracts["freeforall.sol"]["FreeForAll"].abi;
                    let bytecode = output.contracts["freeforall.sol"]["FreeForAll"].evm.bytecode.object;
                    // console.log(bytecode)
                    this.contract =  new this.web3Custom.web3.eth.Contract(ABI);
                    // this.contract = contract_std.clone();
                    this.contract.defaultAccount = this.web3Custom.signer.address;
                    // contract.defaultChain = "goerli";
                    // contract.defaultHardfork = "byzantium";
                    this.web3Custom.web3.eth.getChainId().then((chainid) => {
                        console.log("chainid: ", chainid)
                        this.web3Custom.web3.eth.net.getId().then((networkid) => {
                            console.log("networkid: ", networkid)
                            this.contract.defaultCommon = {customChain: {name: 'khy', chainId: chainid, networkId: networkid}, baseChain: 'mainnet', hardfork: 'petersburg'};
                        })
                    })
                    // console.log(web3.web3.eth.accounts)
                    let gasPrice = 3000000000;
                    for(let i = 0; i != 3; i++){
                        let succes = false;
                        if(succes){
                            break;
                        }
                        this.contract.deploy({ data: bytecode, arguments:[this.contract.defaultAccount, this.gamePriceWei]}).estimateGas().then((gas) => {
                            console.log('gas: ', gas);
                            this.contract.deploy({ data: bytecode, arguments:[this.contract.defaultAccount, this.gamePriceWei] }).send({ from: this.web3Custom.signer.address, gas: 87300, gasPrice: (Math.round(gasPrice*=1.1)).toString()})
                                .on("receipt", (receipt) => {
                                    // Contract Address will be returned here
                                    console.log("Contract Address:", receipt.contractAddress);
                                })
                                .then((contract) =>{
                                    console.log(contract);
                                })
                                .catch((e)=>{
                                    console.log('failed to deploy attempt:', i, 'gas price:', gasPrice);
                                    console.log(e)
                                })
                        });
                    }
                }).catch((error) => {
                    // log error in a core dump send the core dump to server
                    console.log("getBalance error:", error);
                });
            }).catch((error:string) => {
                // log error in a core dump send the core dump to server
                console.log("getEthPrice error:", error);
            });
        }catch(e){
            // log error in a core dump send the core dump to server
            console.log(e);
        }
    }
    sendCrypto(index:number, amount:number){
        console.log("gameType:", this.gameType)
        if(this.gameType > 0){
            console.log("amount: ", amount);
            if(amount > 0){
                try{
                    this.contract.methods.gain(this.characters[index].walletId).send((err:string, data:string) => {
                        console.log("Initial Data:", data);
                        console.log("err:", err);
                        if(err){
                            return false
                        }
                        this.characters[index].pushTx(new Tx("", "", "21000", this.gamePriceWei));
                    }).catch((error:string)=>{
                        return false;
                    });
                }catch(e){
                    // log error in a core dump send the core dump to server
                    console.log(e);
                }
            }
        }
    }
    /********
     * TEAM *
     ********/
    // TODO: make teams
    joinTeam(){}
    switchTeam(){}

    /********
     * ITEM *
     ********/
    addItem(type:itemts.Type, x:number, y:number){
        this.items.push(new itemts.Artifact(type, x, y))
        this.buffer[y] = utils.replaceAt(this.buffer[y], x, itemts.typeToChar(type))
        this.tick();
    }
    takeItem(id:string, item:string){
        var characterIndex = this.characters.findIndex((perso => perso.id == id));
        this.characters[characterIndex].getItem(item);
    }
    // TODO: use items
    useItem(){}

    notify(socket:string, type:string, msg:string){
        if(type == "walletConnect"){
            console.log("wc: ", socket)
            this.socket.emit('walletConnect', socket, msg);
        }else if(type == "connected"){
            this.connectedSockets.push(socket);
            this.socket.emit('connected', socket, this.roomGame);
            this.socket.emit('nbOfUsr', this.allSockets, this.connectedSockets.length, this.confirmedSockets.length);
        }else if(type == "confirmed"){
            this.connectedSockets.forEach((element,index)=>{
                if(element==socket) this.connectedSockets.splice(index,1)
            });
            this.confirmedSockets.push(socket);
            this.socket.emit('confirmed', socket);
            this.socket.emit('nbOfUsr', this.allSockets, this.connectedSockets.length, this.confirmedSockets.length);
        }else if(type == "err"){
            this.socket.emit('err', socket, msg)
        }
    }
}