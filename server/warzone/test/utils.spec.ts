import {randomInteger} from "../src/utils";
import {numberToDirection} from "../src/utils";
import {Direction} from "../src/utils";

describe('test utils', () => {
    test('random integer in range', () => {
        let res = 50;
        res = randomInteger(10, 1);
        expect(res).toBeGreaterThan(0);
        expect(res).toBeLessThan(11);
    })
    test('number to direction front', () => {
        let res = numberToDirection(0);
        expect(res).toBe(Direction.Front)
    })
    test('number to direction back', () => {
        let res = numberToDirection(1);
        expect(res).toBe(Direction.Back)
    })
    test('number to direction front', () => {
        let res = numberToDirection(2);
        expect(res).toBe(Direction.Right)
    })
    test('number to direction front', () => {
        let res = numberToDirection(3);
        expect(res).toBe(Direction.Left)
    })
    test('number to direction undefined', () => {
        let res = numberToDirection(5);
        expect(res).toBe(Direction.Front)
    })
});