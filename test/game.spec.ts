import {Map} from "../build/game.js";

describe('test game state', () => {
    let map = new Map("42","43", 12);

    test('game not started', () => {
        expect(map.started).toBe(false);
    })
    test('game not prestarted', () => {
        expect(map.prestarted).toBe(false);
    })
    test('game available', () => {
        expect(map.available()).toBe(true);
    })
});

describe('test game on user connect', () => {
    test('on create game character no show', () => {
        let map = new Map("42","43", 0);
        map.joinGame("232", 1, "player1", 'o', false);
        let res = false;
        for(let i=0; i != map.buffer.length; i++){
            if(map.buffer[i].includes('o')){
                res = true
            }
        }
        expect(res).toBe(false);
    })
    test('test user connect and disconnect on confirmed', () => {
        let map = new Map("42","43", 0);
        map.joinGame("232", 1, "player1", 'o', false);
        map.joinGame("233", 2, "player2", 'o', false);

        // TODO wait for users connected and disconnect one, the game shall not start
    })
});

