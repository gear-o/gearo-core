export interface IPlayerObserver{
    notify(socket:string, type:string, msg:string): void
}

export class IPlayer{
    private observers:IPlayerObserver[] = [];
    attach(observer:IPlayerObserver){
        this.observers.push(observer);
    }

    sendMsg(socket:string, type:string, msg:string){
        for(let i = 0; i != this.observers.length; i++){
            this.observers[i].notify(socket, type, msg);
        }
    }
}