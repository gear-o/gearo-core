export enum Type{
    Shield=0,
    FastGun,
    Invisibility,
    Crypto
}

export function typeToChar(type:Type){
    switch(type){
        case Type.Shield:{
            return '@'
        }
        case Type.FastGun:{
            return '#'
        }
        case Type.Invisibility:{
            return '*'
        }
        case Type.Crypto:{
            return '$'
        }
        default:
            // log into logger wrong item type
            return ''
    }
}

export function charToType(char:string){
    switch(char){
        case '@':{
            return Type.Shield;
        }
        case '#':{
            return Type.FastGun;
        }
        case '*':{
            return Type.Invisibility
        }
        case '$':{
            return Type.Crypto
        }
        default:
            // log into logger wrong item type
            return ''
    }
}

export class Artifact{
    constructor(public type:Type, public x:number, public y:number){
        this.type = type;
        this.x = x;
        this.y =y;
    }
}