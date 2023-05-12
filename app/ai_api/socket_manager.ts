export interface ServerToClientEvents {
    gameId: (roomName:string, id:string) => void;
    walletConnect: (uri:string) => void;
    sendMap: (map:string) => void;
    gameOver: (id:string, infos:any) => void;
    nbOfUsr: (nb:number) => void;
    quitGame: () => void;
    // err
    maintenance: (count:number) => void;
    maxUserReach: (msg:string) => void;
    version: (version:string) => void;
    err: (err:string) => void;
}
export interface ClientToServerEvents {
    // reconnection: (roomName:string, gameId:string, partyType:string) => void;
    join: (id:number, walletId:string, partyType:string, name:string, logo:string, gameVersion:string) => void;
    move: (id:string, keyname:string, roomName:string) => void;
    shoot: (id:string, roomName:string) => void;
    quitGame: (roomName:string, id:string) => void;
}