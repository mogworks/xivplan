import { expect } from 'vitest';
import { decodeGameStrategyBoardString } from './decoder';
import { encodeGameStrategyBoardString } from './encoder';

describe('encoder', () => {
    test('should encode and decode correctly', () => {
        const testData = new Uint8Array([1, 2, 3, 4, 5]);
        const encoded = encodeGameStrategyBoardString(testData);
        const decoded = decodeGameStrategyBoardString(encoded);
        expect(decoded).toEqual(testData);
    });

    test('should handle different seeds', () => {
        const testData = new Uint8Array([10, 20, 30, 40, 50]);
        for (let seed = 0; seed < 64; seed++) {
            const encoded = encodeGameStrategyBoardString(testData, seed);
            const decoded = decodeGameStrategyBoardString(encoded);
            expect(decoded).toEqual(testData);
        }
    });
});
