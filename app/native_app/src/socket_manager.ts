
export interface ServerToClientEvents {
    sendMap: (map:string) => void;
    gameId: (roomName:string, id:string) => void;
    gameOver: (id:string, infos:any) => void;
    win: (id:string) => void;
    maintenance: (count:number) => void;
    version: (version:string) => void;
    quitGame: () => void;
    joinGame: (gameId:string, roomGame:string, partyType:number) => void;
    sendNb: (nb:string) => void;
    maxUserReach: (msg:string) => void;
}
export interface ClientToServerEvents {
    reconnection: (roomName:string, gameId:string, partyType:string) => void;
    gameJoin: (roomName:string) => void;
    join: (id:number, walletId:string, partyType:string, name:string, logo:string, gameVersion:string) => void;
    payed: (gameId:string, roomGame:string) => void;
    move: (id:string, keyname:string, roomName:string) => void;
    shoot: (id:string, roomName:string) => void;
    main: () => void;
    disconnected:(roomName:string) => void;
    quitGame: (roomName:string, id:string) => void;
    version: () => void;
}