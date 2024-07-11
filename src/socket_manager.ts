
export interface ServerToClientEvents {
    // game to client
    // to specific client
    gameId: (id:string) => void;
    gameRoom: (roomName:string) => void
    joinGame: (gameId:string, roomGame:string, partyType:number) => void;
    version: (version:string) => void;
    maxUserReach: (message:string) => void;
    whoIsU: (map:string) => void;
    gameOver: (infos:string) => void;
    walletConnect: (uri:string) => void;
    connected: (roomGame:string) => void;
    confirmed: () => void;
    // to room client
    sendMap: (map:string) => void;
    nbOfUsr: (waiting:number, connected:number, confirmed:number) => void;
    enterGame: () => void;
    gameInfo: (info:string) => void;
    // to all clients
    maintenance: () => void;
    // server to game
    showUser: (gameId:string) => void;
    move: (id:string, keyname:string) => void;
    shoot: (id:string) => void;
    quitGame: (id:string) => void;
    // server to sentinel
    gameNB: (infos:string) => void;
    nbOfUser: (nb:number) => void;
    salary: (salary:string) => void;
    promocode: (codes:Array<String>) => void;
}
export interface ClientToServerEvents {
    // game to server
    // maybe server to server instead
    // joinGame: (infos:string) => void;
    joinRoom: (roomName:string) => void;
    reconnection: (roomName:string, gameId:string, partyType:string) => void;
    gameOver: (roomClients:string, id:string, infos:any) => void;
    sendMap: (roomClients:string, map:string) => void;
    endGame: (roomGame:string) => void;
    joinAll: (allSocket:Array<[string, string]>, roomGame:string, roomClient:string, gameType:number, nbOfUsers:number) => void;
    nbOfUsr: (allSocket:Array<[string, string]>, connected:number, confirmed:number) => void;
    walletConnect: (socket:string, uri:string) => void;
    connected: (socket:string, roomGame:string) => void;
    confirmed: (socket:string) => void;
    gameRoom: (socket:string, roomName:string) => void
    err: (socket:string, err:string) => void;
    whoIsU: (socket:string, map:string) => void;
    gameInfo: (roomClients:string, info:string) => void;
    // client to server
    join: (id:number, walletId:string, promocode:string, partyType:string, name:string, logo:string, gameVersion:string) => string;
    move: (id:string, keyname:string, roomName:string) => void;
    shoot: (id:string, roomName:string) => void;
    quitGame: (roomName:string, id:string) => void;
    // version: (versionCli:string) => void;
    // use for later
    disconnected:(roomName:string) => void;
    // sentinel to server
    gameNB: () => void;
    nbOfUser: () => void;
    maxNbOfUser: (nb:number) => void;
    killServer: (count:number) => void;
    launchServer: () => void;
    salary: () => void;
    setMaxOfUser: (max:number, msg:string) => void;
    promocodegen: (partyType:number, nb:number) => void;
    promocode: (partyType:number) => void;
}
export interface InterServerEvents {
    ping: () => void;
}