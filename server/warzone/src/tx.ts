export class Tx{
    amount;
    hash;
    gas;
    gameFee;
    constructor(hash:string, amount:string, gas:string, gameFee:number){
        this.hash = hash;
        this.amount = amount;
        this.gas = gas;
        this.gameFee = gameFee;
    }

    toJson(){
        return {hash:this.hash, amount:this.amount, gas:this.gas, gameFee:this.gameFee}
    }
}