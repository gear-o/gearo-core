
export interface ServerToClientEvents {
    sendMap: (map:string) => void;
    gameId: (id:string) => void;
    gameover: (id:string) => void;
    win: (id:string) => void
    gameNB: () => void;
    nbOfUser: (nb:number) => void;
    salary: (salary:string) => void;
    promocode: (codes:Array<String>) => void;
}
export interface ClientToServerEvents {
    gameNB: () => void;
    nbOfUser: () => void;
    killServer: (count:number) => void;
    launchServer: () => void;
    join: (id:number, walletId:string, partyType:string, name:string, logo:string) => void;
    move: (id:string, keyname:string, roomName:string) => void;
    shoot: (id:string, roomName:string) => void;
    salary: () => void;
    disconnected:(roomName:string) => void;
    setMaxOfUser: (max:number, msg:string) => void;
    promocodegen: (partyType:number, nb:number) => void;
    promocode: (partyType:number) => void;
}