import * as SocketManager from "./socket_manager.js"
import {Socket, io} from "socket.io-client"

export class GearO {
  socket : Socket<SocketManager.ServerToClientEvents, SocketManager.ClientToServerEvents> = io("http://localhost:3000");
  game:string = "";
  id:string = "";
  version:string = "1.0.2"

  constructor(){
    this.socket.connect();
    this.socket.on('gameId', (game:string, id:string) =>{this.onGameId(game, id)});
    this.socket.on('walletConnect', (uri:string) =>{this.onWalletConnect(uri)});
    this.socket.on('sendMap', (map:string) =>{this.onSendMap(map)});
    this.socket.on('gameOver', () =>{this.onGameOver()});
    this.socket.on('nbOfUsr', (nb:number) =>{this.onNbOfUser(nb)});
    // err
    this.socket.on('version', (version:string) =>{this.onVersionErr(version)});
    this.socket.on('maintenance', () =>{this.onMaintenance()});
    this.socket.on('maxUserReach', () =>{this.onMaxUsrReach()});
    this.socket.on('err', (err:string) =>{this.onErr(err)});
  }

  // send
  joinFree(){
    this.socket.emit('join', 0, "null", '0', "", "", this.version);
  }
  join1(){
    this.socket.emit('join', 0, "null", '1', "", "", this.version);
  }
  join10(){
    this.socket.emit('join', 0, "null", '10', "", "", this.version);
  }
  join50(){
    this.socket.emit('join', 0, "null", '50', "", "", this.version);
  }
  quitGame(){
    this.socket.emit('quitGame', this.id, this.game);
  }
  up(){
    this.socket.emit('move', this.id, "up", this.game);
  }
  down(){
    this.socket.emit('move', this.id, "up", this.game);
  }
  right(){
    this.socket.emit('move', this.id, "up", this.game);
  }
  left(){
    this.socket.emit('move', this.id, "up", this.game);
  }
  shoot(){
    this.socket.emit('shoot', this.id, this.game);
  }

  // receive
  onGameId(_game:string, _id:string){
    this.game = _game;
    this.id = _id;
  }
  onWalletConnect(uri:string){
    // override
  }
  onSendMap(map:string){
    // override
  }
  onGameOver(){
    // override
  }
  onNbOfUser(nb:number){
    // override
  }
  // error
  onVersionErr(version:string){
    // override
  }
  onMaintenance(){
    // override
  }
  onMaxUsrReach(){
    // override
  }
  onErr(err:string){
    // override
  }
}