// process.env.DEBUG="*"
import * as SocketManager from "./socket_manager.js"
import {Socket, io} from "socket.io-client"
import { BrowserWindow, ipcMain } from 'electron';
import WalletConnect from "@walletconnect/client";
import QRCode from 'qrcode';
import Web3 from 'web3'
import fs from 'fs';
const ethPrice = require('eth-price');
const dateTime = require('node-datetime');
// const storage = require('electron-storage');

// /!\ ugly code on purpose /!\
// touch the code and you may lose :)
// but if you do so, you should try IA ;)

    /********
     * GAME *
     ********/

// TODO:
//  -make game in teams
//  -make game free-for-all
//  -screen version of the cli on the main page
//  -delete logo
//  -create electron windows to run the game

let socket : Socket<SocketManager.ServerToClientEvents, SocketManager.ClientToServerEvents> = io("http://localhost:3000");
let _id="";
let _roomName="";
let serverId=1;
let name="keet";
let logo='o';
let currentPage = "menu";
let version = "";
let txFile = __dirname + "/../assets/txFile.json";
let gameFile = __dirname + "/../assets/gameFile.json";
let keyFile =__dirname + "/../assets/keyFile.json";
let versionFile =__dirname + "/../assets/version.json";
let keyUp = "ArrowUp";
let keyDown = "ArrowDown";
let keyLeft = "ArrowLeft";
let keyRight = "ArrowRight";
let keyShoot = " ";
const wallet = new WalletConnect({
    bridge: "https://bridge.walletconnect.org",
    clientMeta: {
      description: "WalletConnect Developer App",
      url: "https://walletconnect.org",
      icons: ["https://walletconnect.org/walletconnect-logo.png"],
      name: "WalletConnect",
    },
});

socket.connect();

/*********
 * UTILS *
 *********/
let versionErr = "gear-o is behind the version accepted by the server, please download newest version on the website";
let maintenanceMsg = "server on maintenance please wait"

function getVersion(){
    if(fs.existsSync(versionFile)){
        fs.readFile(versionFile, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            let obj = JSON.parse(data);
            let v = obj["version"];
            version = v;
        });
     }
}

function appendJson(jsonFile:string, text:any){
    let obj = [];
    if(!fs.existsSync(jsonFile)){
        obj.push(text);
        let tojson = JSON.stringify(obj);
        fs.writeFileSync(jsonFile,tojson,{encoding:'utf8',flag:'w'});
    }else{
        fs.readFile(jsonFile, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            let json = JSON.parse(data);
            json.push(text)
            let tojson = JSON.stringify(json)
            fs.writeFileSync(jsonFile,tojson,{encoding:'utf8',flag:'w'});
        });
    }
}

function overwriteJson(jsonFile:string, data:any){
    let tojson = JSON.stringify(data)
    fs.writeFileSync(jsonFile,tojson,{encoding:'utf8',flag:'w'});
}

function emptyJson(jsonFile:string){
    fs.writeFileSync(jsonFile,"",{encoding:'utf8',flag:'w'});
}

function join(serverId:number, walletId:string, partyType:string, name:string, logo:string){
    socket.emit('join', serverId, walletId, partyType, name, logo, version);
}

enum Page{MENU="menu", SETTINGS="settings", GAME="game", GAMEINFO="gameinfo", WAIT="wait", SHOP="shop", TX="tx", POPUP="popup", WALLETCONNECT="walletconnect"};

function Input(input:Electron.Input){
    if(currentPage == "menu" && input.type== 'keyDown'){
        // console.log(input)
        if(input.key == keyUp){
            // Main.mainWindow.webContents.send("previous");
        }
        if(input.key == keyUp){
            // Main.mainWindow.webContents.send("next");
        }
        if(input.key == "Enter"){
            // Main.mainWindow.webContents.send("enter");
        }
    }else if(currentPage == "game" && input.type== 'keyDown'){
        if(input.key == keyUp){
            socket.emit('move', _id, "up", _roomName);
        }
        if(input.key == keyDown){
            socket.emit('move', _id, "down", _roomName);
        }
        if(input.key == keyLeft){
            socket.emit('move', _id, "left", _roomName);
        }
        if(input.key == keyRight){
            socket.emit('move', _id, "right", _roomName);
        }
        if(input.key == keyShoot){
            socket.emit('shoot', _id, _roomName);
        }
        if(input.key == "x"){
            // TODO: shield
        }
        if(input.key == "c"){
            // TODO: fast bullet
        }
        if(input.key == "v"){
            // TODO: invisibility
            console.log("v")
        }
        if(input.key == "q"){
            // TODO: quit the game and return to the main currentPage
            // Main.goToPage(Page.MENU);
        }
    }else if(currentPage == "settings" && input.type== 'keyDown'){
        // TODO: settings page
    }
}

function popUp(infos:string) {
    let popUp = new BrowserWindow({ width: 600, height: 600, webPreferences: {nodeIntegration: true,contextIsolation: false}});
    popUp.setBackgroundColor("black");
    popUp.loadURL('file://' + __dirname + '/../html/popup.html').then(() => {
        popUp.webContents.executeJavaScript("document.getElementById('infos').innerHTML = '"+infos+"';");
        popUp.show();
    });
}

function fillKey(type:string, value:string){
    switch(type){
        case "up":
            keyUp = value;
            break;
        case "down":
            keyDown = value;
            break;
        case "left":
            keyLeft = value;
            break;
        case "right":
            keyRight = value;
            break;
        case "shoot":
            keyShoot = value;
            break;
    }
}

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow:any;
    static wallet_id:string;
    static tx_hash:any;
    static joined:boolean;
    static gameInfos:string;
    static waitInfos:string;
    static partyType:string;
    static gameLaunched:boolean;
    static gamePageLoad:boolean;

    /************
     * ELECTRON *
     ************/
    private static goToPage(page:Page, infos:string[]=[]){
        Main.mainWindow
            .loadURL('file://'+__dirname+'/../html/'+page+'.html', { extraHeaders: 'pragma: no-cache\n' }).then(() => {
                Main.mainWindow.show();
                if(page == Page.POPUP){
                    Main.mainWindow.webContents.executeJavaScript("document.getElementById('infos').innerHTML = '"+infos[0]+"';");
                }
                if(page == Page.WALLETCONNECT){
                    Main.mainWindow.webContents.executeJavaScript("document.getElementById('view').src = '"+infos[0]+"'; document.getElementById('gameType').innerHTML = '"+infos[1]+"$';");
                }
            });
        currentPage=page;
    }

    private static onWindowAllClosed() {
        socket.emit('disconnected', _roomName);
        socket.disconnect();
        socket.close();
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        // Dereference the window object
        // Main.mainWindow = null;
        if(wallet.connected.valueOf()){
            let kill_message;
            wallet.killSession(kill_message);
            // log kill message in pop up window
            console.log(kill_message)
        }
    }

    private static mainWindowListener() {
        getVersion();
        Main.mainWindow = new BrowserWindow({ width: 800, height: 600, icon: __dirname + '/../images/gear-o-logo.png', webPreferences: {nodeIntegration: true,contextIsolation: false, webviewTag:true}});
        Main.mainWindow.setBackgroundColor("black");
        Main.mainWindow
        .loadURL('file://'+__dirname+'/../html/menu.html').then(() => { Main.mainWindow.show(); });
        Main.mainWindow.maximize();
        Main.mainWindow.on('closed', Main.onClose);
        Main.mainWindow.webContents.on("before-input-event", (event, input) => {
            Input(input);
        });
        Main.mainWindow.webContents.on('did-finish-load', () =>{
            if(currentPage == Page.WAIT){
                Main.mainWindow.webContents.send("nbOfUsers", this.waitInfos);
            }
            if(currentPage == Page.GAMEINFO){
                Main.mainWindow.webContents.send("infos", this.gameInfos);
            }
            if(currentPage == Page.TX){
                Main.mainWindow.webContents.send("txinfos", this.tx_hash);
            }
            if(currentPage == Page.GAME){
                this.gamePageLoad = true;
            }
            if(currentPage == Page.SETTINGS){
                Main.mainWindow.webContents.send("keys", keyUp, keyDown, keyLeft, keyRight, keyShoot);
            }
        });
        ipcMain.on('join', (event, data) => {
            let amount = data;
            console.log(data);
            if(!this.joined && socket.connected){
                if(data != 0){
                    console.log("paying game");
                    if (!wallet.connected) {
                        console.log("no session connected");
                        wallet.createSession().then(() => {
                            // get uri for QR Code modal
                            const uri = wallet.uri;
                             QRCode.toDataURL(uri, function (err, url) {
                                Main.goToPage(Page.WALLETCONNECT, [url, amount]);
                            });
                        });
                    }
                    wallet.on("connect", (error, payload) => {
                        if (error)
                        {
                            throw error;
                            // TODO: show error to user
                        }
                        // After the connection is successful, the wallet account and chain ID will be returned
                        const { accounts, chainId } = payload.params[0];
                        this.wallet_id=accounts[0];
                        join(serverId, this.wallet_id, amount, name, logo);
                    })
                }else{
                    console.log("free game")
                    join(serverId, "null", "0", name, logo);
                }
            }
        });
        ipcMain.on('settings', (event) => {
            Main.goToPage(Page.SETTINGS);
        });
        ipcMain.on('menu', (event)=>{
            Main.goToPage(Page.MENU);
            this.waitInfos = '';
            this.gameInfos = '';
        });
        ipcMain.on('quitGame', (event)=>{
            socket.emit('quitGame', _roomName, _id);
            _id = "";
            _roomName = "";
            this.gamePageLoad = false;
            this.joined = false;
            this.waitInfos = '';
            this.gameInfos = '';
            Main.goToPage(Page.MENU);
        });
        ipcMain.on('shop', (event) =>{
            Main.goToPage(Page.SHOP);
        });
        ipcMain.on('tx', (event) =>{
            if(fs.existsSync(txFile)){
                fs.readFile(txFile, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    this.tx_hash = JSON.parse(data);
                });
            }
            Main.goToPage(Page.TX);
        });
        ipcMain.on('keySetting', (event, id, key) =>{
            console.log("id: ", id, " key: ", key);
            if(fs.existsSync(keyFile)){
                fs.readFile(keyFile, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    let obj = JSON.parse(data);
                    fillKey(id, key);
                    obj[id] = key;
                    let toJson = JSON.stringify(obj);
                    fs.writeFileSync(keyFile,toJson,{encoding:'utf8',flag:'w'});
                });
            }
        });
        // key retrieve
        if(fs.existsSync(keyFile)){
            fs.readFile(keyFile, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                let obj = JSON.parse(data);
                keyUp = obj["up"];
                keyDown = obj["down"];
                keyLeft = obj["left"];
                keyRight = obj["right"];
                keyShoot = obj["shoot"];
            });
        }else{
            let obj = {up:keyUp, down:keyDown, left:keyLeft, right:keyRight, shoot:keyShoot}
            let toJson = JSON.stringify(obj);
            fs.writeFileSync(keyFile,toJson,{encoding:'utf8',flag:'w'});
        }
    }

    private static socketListener() {
        // socket
        socket.on('disconnect', () =>{
        });
        socket.on('connect', () =>{
            if(fs.existsSync(gameFile)){
                fs.readFile(gameFile, 'utf8', (err, data) => {
                    if(data.length != 0){
                        let obj = JSON.parse(data);
                        _id = obj['id'];
                        _roomName = obj['roomname'];
                        socket.emit('reconnection', obj['roomname'], obj['id'], obj['partytype']);
                        this.joined =true;
                        Main.goToPage(Page.GAME);
                    }
                });
            }
        });
        socket.on('sendNb', (nb:string) => {
            this.waitInfos = nb;
            Main.mainWindow.webContents.send("nbOfUsers", this.waitInfos);
        });
        socket.on('joinGame', (gameId:string, roomGame:string, partyType:number) => {
            let amount = partyType;
            this.partyType = amount.toString();
            this.gameLaunched = true;
            if(amount != 0){
                console.log("enter in game : ", amount)
                let web3 = new Web3();
                ethPrice('usd,eth').then((ethInfo:any) =>{
                    console.log(ethInfo);
                    ethInfo = ethInfo[0].replace('USD: ','')
                    console.log(ethInfo);
                    let ethAmount = (amount/Number(ethInfo)).toFixed(15).toString();
                    console.log(ethAmount);
                    let weiEth = web3.utils.toWei(ethAmount,'ether');
                    console.log(weiEth);
                    const tx = {
                      from: this.wallet_id,
                      to: "0x3905A2395A33Aba21e27c66238e2806B4e9A8102",
                      value: weiEth,
                      data: "0x",
                    };
                    return tx;
                }).then((tx:any)=>{
                    // send transaction to account
                    wallet.sendTransaction(tx)
                    .then((result) => {
                        // Returns transaction id (hash)
                        // TODO:
                        // - send hash on emit payed to the server verifying
                        socket.emit('payed', gameId, roomGame);
                        var dt = dateTime.create();
                        var formatted = dt.format('Y-m-d H:M:S');
                        appendJson(txFile, {type:"send", time: formatted.toString(), hash: result, amount: amount, status:"payed"});
                        console.log(result);
                        Main.goToPage(Page.GAME);
                        _id = gameId;
                        _roomName= roomGame;
                        wallet.killSession();
                    })
                    .catch((error) => {
                        // TODO: on rejection:
                        // -send to server rejection
                        this.joined = false;
                        socket.emit('quitGame', gameId, roomGame);
                        Main.goToPage(Page.POPUP, [error]);
                    });
                });
            }else{
                Main.goToPage(Page.GAME);
                _id = gameId;
                _roomName= roomGame;
                this.joined = false;
            }
            if(_roomName && _id){
                overwriteJson(gameFile, {id: gameId, roomname: roomGame, partytype: partyType});
            }
        });
        socket.on('gameId', (roomName:string, id:string) => {
            console.log("game id: ", id)
            _roomName = roomName;
            _id = id;
            this.joined =true;
            Main.goToPage(Page.WAIT);
        });
        socket.on('sendMap', (map:string) => {
            if(this.gamePageLoad){
                Main.mainWindow.webContents.send("data", map);
            }
        });
        socket.on('gameOver', (id:string, infos:any) => {
            // receive username gameover
            Main.mainWindow.webContents.send("gameinfo", id);
            if(id == _id){
                this.gamePageLoad = false;
                this.gameLaunched = false;
                this.partyType = "";
                emptyJson(gameFile);
                console.log("gameover: ", infos);
                var dt = dateTime.create();
                var formatted = dt.format('Y-m-d H:M:S');
                let obj = infos;
                console.log(obj['killed'])
                appendJson(txFile, {type:"receive", time: formatted, hash: obj['hash'], amount: obj['amount'] });
                Main.goToPage(Page.POPUP, ["Killed: "+obj['killed']]);
                // socket.emit('disconnected', roomName);
                this.joined = false;
            }
        });
        socket.on('quitGame', () => {
            _id = "";
            _roomName = "";
            this.joined = false;
            this.gameInfos = '';
            Main.goToPage(Page.MENU);
        });
        socket.on('maintenance', (count:number) => {
            console.log("maintenance");
            // send pop serveur in maintenance
            popUp(maintenanceMsg);
        });
        socket.on('version', (version:string) => {
            console.log("version error: ", version)
            // send pop up window with game version error
            popUp(versionErr);
        });
        socket.on('maxUserReach', (msg:string) => {
            console.log("maxuserreach");
            // send pop up window with game version error
            popUp(msg);
        })
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.mainWindowListener);
        Main.application.on('ready', Main.socketListener);
    }
}