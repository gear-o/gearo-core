
export function randomInteger(max:number, min:number){
    return Math.round(Math.random() * (max-min) + min)
}

/**
 * object = enum you want to check
 * return an array with [min, max]
 */
export function getMinMaxOfEnum(e: object) {
    const values = Object.keys(e).map(k => k === "" ? NaN : +k).filter(k => !isNaN(k));
    return [Math.min(...values), Math.max(...values)];
}

export function manageKey(keyName:string){
    if (keyName === 'q') {
        process.exit();
    }
}

export function replaceAt(str:string, index:number, chr:string){
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

export enum Direction{
    Front = 0,
    Back,
    Right,
    Left
}

export function numberToDirection(number:number){
    switch(number){
        case 0 :{return Direction.Front;};
        case 1 :{return Direction.Back;};
        case 2 :{return Direction.Right;};
        case 3 :{return Direction.Left;};
        default: {return Direction.Front}
    }
}

export function moveBulletUtils(direction:Direction){
    let bulletChar:string;
    let tot_x:number;
    let tot_y:number;

    switch(direction){
        case Direction.Front:{
            bulletChar = '\'';
            tot_x = 0;
            tot_y = -1;
            break;
        }
        case Direction.Back:{
            bulletChar = '\'';
            tot_x = 0;
            tot_y = 1;
            break;
        }
        case Direction.Left:{
            bulletChar = '\-';
            tot_x = -1;
            tot_y = 0;
            break;
        }
        case Direction.Right:{
            bulletChar = '\-';
            tot_x = 1;
            tot_y = 0;
            break;
        }
    }
    return [tot_x, tot_y, bulletChar]
}

export function moveUserUtils(keyname:string){
    let tot_x = 0;
    let tot_y = 0;
    let direction:Direction;
    switch(keyname){
        case "up":{
            tot_y = -1;
            tot_x = 0;
            direction = Direction.Front;
            break;
        }
        case "down":{
            tot_y = 1;
            tot_x = 0;
            direction = Direction.Back;
            break;
        }
        case "left":{
            tot_y = 0;
            tot_x = -1;
            direction = Direction.Left;
            break;
        }
        case "right":{
            tot_y = 0;
            tot_x = 1;
            direction = Direction.Right;
            break;
        }
        default:
            // log wrong direction maybe crackers
            direction = Direction.Back
    }
    return [tot_x, tot_y, direction]
}