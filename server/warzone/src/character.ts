import * as utils from "./utils.js"
import * as artifact from "./artifact.js"
import {Tx} from './tx.js'
import WalletConnect from "@walletconnect/client";
import QRCode from 'qrcode';
import Web3 from 'web3';
const ethPrice = require('eth-price');
import {IPlayer} from "./playerObserver.js"
import {Contract} from 'web3-eth-contract';

// TODO:
// -paint character with the color of the team
// -connect bullet speed to the map
// -use artifacts
export class Character extends IPlayer {
    id:string = "";
    serverId:number = -1;
    promo:boolean = false;
    walletId:string = '';
    logo:string = '';
    name:string = '';
    x:number;
    y:number;
    direction:utils.Direction = utils.Direction.Front;
    numberOfShot:number = 3;
    shotLeft:number = this.numberOfShot;
    bulletSpeed:number = 1;
    items = new Array<string>()
    bonus:number = 0;
    killed_people_nb = 0;
    killed_people:Array<Array<string>> = [];
    socket:string;
    txInfo:Array<Tx> = [];
    connected:boolean = false;
    confirmed:boolean = false;
    web3 = new Web3();
    wallet = new WalletConnect({
        bridge: "https://bridge.walletconnect.org",
        clientMeta: {
          description: "WalletConnect Developer App",
          url: "https://walletconnect.org",
          icons: ["https://walletconnect.org/walletconnect-logo.png"],
          name: "WalletConnect",
        },
    });
    partyType:string = "";

    constructor(socket:string, id:string, serverId:number, promo:boolean, name:string, logo:string, x:number, y:number, numberOfShot:number){
        super();
        this.id = id;

        this.serverId = serverId;
        this.promo = promo;
        this.logo = logo;
        this.name = name;
        this.x = x;
        this.y = y;
        this.numberOfShot = numberOfShot;
        this.socket = socket;

        this.wallet.on("connect", (error, payload) => {
            if (error)
            {
                throw error;
                // TODO: show error to user
            }
            // After the connection is successful, the wallet account and chain ID will be returned
            const { accounts, chainId } = payload.params[0];
            this.walletId=accounts[0];
            this.connected = true;
            this.sendMsg(this.socket, "connected", "");
        })
    }
    shot(){
        this.shotLeft--;
        var reload = setInterval(() => {
            this.shotLeft = this.numberOfShot;
        }, 10000)
    }
    getItem(item:string){
        this.items.push(item);
    }
    getBonus(bonus:number){
        this.bonus+=bonus;
    }
    // crypto
    gameConnect(partyType:number){
        if(this.promo){
            this.connected = true;
            this.sendMsg(this.socket, "connected", "");
            console.log("connect with promo");
            return;
        }
        this.partyType = partyType.toString();
        console.log('game connect to amount', partyType)
        if(partyType != 0){
            console.log("send walletconnect uri");
            if (!this.wallet.connected) {
                console.log("no session connected");
                this.wallet.createSession().then(() => {
                    // get uri for QR Code modal
                    const uri = this.wallet.uri;
                    QRCode.toDataURL(uri).then((url)=>{this.sendMsg(this.socket, "walletConnect", url);})
                });
            }
        }else{
            // delete user from game
            this.connected = true;
            this.sendMsg(this.socket, "connected", "");
            console.log("free game")
        }
    }
    walletConnected(){
        return this.connected;
    }
    enterGame(contract:Contract, amount:Number){
        if(this.promo){
            this.confirmed = true;
            this.sendMsg(this.socket, "confirmed", "");
            console.log("enter with promo");
            return;
        }
        // let amount = Number(this.partyType);
        if(amount != 0){
            console.log("enter in game : ", amount)
            this.web3.eth.getBalance(this.walletId).then((balance) =>{
                balance = this.web3.utils.fromWei(balance);
                if(Number(balance) > Number(amount)){
                    contract.methods.enter({ from:this.walletId, value: Number(balance) }).call((err:string, data:string) => {
                        console.log("Initial Data:", data);
                        console.log("err:", err);
                        if(err){
                            return false
                        }
                    }).catch((error:string)=>{
                        return false;
                    });
                }else{
                    return false;
                }
            });
        }else{
            this.confirmed = true;
            this.sendMsg(this.socket, "confirmed", "");
        }
    }
    enterConfirmed(){
        return this.confirmed;
    }
    pushTx(tx:Tx){
        this.txInfo.push(tx);
    }
    txToJson(){
        let json = [];
        for(let i = 0; i != this.txInfo.length; i++){
            json.push(this.txInfo[i].toJson());
        }
        return JSON.stringify(json);
    }
    info(){
        let info = "";
        let nbUserKilled = "you killed " + this.killed_people_nb + ':\n';
        let nameOfKilled = "";
        if(this.killed_people.length != 0){
            for(let i=0; i!=this.killed_people.length; i++){
                if(this.killed_people[i][1]){
                    nameOfKilled = nameOfKilled + this.killed_people[i][1]
                    if(i != this.killed_people.length-1){
                        nameOfKilled = nameOfKilled + ', '
                    }else{
                        nameOfKilled = nameOfKilled + '\n'
                    }
                }
            }
        }
        let cryptoWin = 0;
        for(let i=0; i!=this.txInfo.length; i++){
            cryptoWin += Number(this.txInfo[i].amount)
        }
        let cryptoStr = "you win " + cryptoWin + "$ in ETH\n";
        let winItems = "";
        if(this.items.length != 0){
            winItems = "your items win: " + this.items + '\n';
        }

        info = nbUserKilled + nameOfKilled + cryptoStr + winItems
        return info;
    }
}