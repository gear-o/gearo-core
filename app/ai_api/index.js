"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GearO = void 0;
const socket_io_client_1 = require("socket.io-client");
class GearO {
    socket = (0, socket_io_client_1.io)("http://localhost:3000");
    game = "";
    id = "";
    version = "1.0.2";
    constructor() {
        this.socket.on('gameId', (game, id) => { this.onGameId(game, id); });
        this.socket.on('walletConnect', (uri) => { this.onWalletConnect(uri); });
        this.socket.on('sendMap', (map) => { this.onSendMap(map); });
        this.socket.on('gameOver', () => { this.onGameOver(); });
        this.socket.on('nbOfUsr', (nb) => { this.onNbOfUser(nb); });
        this.socket.on('version', (version) => { this.onVersionErr(version); });
        this.socket.on('maintenance', () => { this.onMaintenance(); });
        this.socket.on('maxUserReach', () => { this.onMaxUsrReach(); });
        this.socket.on('err', (err) => { this.onErr(err); });
    }
    joinFree() {
        this.socket.emit('join', 0, "null", '0', "", "", this.version);
    }
    join1() {
        this.socket.emit('join', 0, "null", '1', "", "", this.version);
    }
    join10() {
        this.socket.emit('join', 0, "null", '10', "", "", this.version);
    }
    join50() {
        this.socket.emit('join', 0, "null", '50', "", "", this.version);
    }
    quitGame() {
        this.socket.emit('quitGame', this.id, this.game);
    }
    up() {
        this.socket.emit('move', this.id, "up", this.game);
    }
    down() {
        this.socket.emit('move', this.id, "up", this.game);
    }
    right() {
        this.socket.emit('move', this.id, "up", this.game);
    }
    left() {
        this.socket.emit('move', this.id, "up", this.game);
    }
    shoot() {
        this.socket.emit('shoot', this.id, this.game);
    }
    onGameId(_game, _id) {
        this.game = _game;
        this.id = _id;
    }
    onWalletConnect(uri) {
    }
    onSendMap(map) {
    }
    onGameOver() {
    }
    onNbOfUser(nb) {
    }
    onVersionErr(version) {
    }
    onMaintenance() {
    }
    onMaxUsrReach() {
    }
    onErr(err) {
    }
}
exports.GearO = GearO;
