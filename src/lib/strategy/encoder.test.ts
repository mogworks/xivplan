import { expect } from 'vitest';
import { decodeGameStrategyBoardString } from './decoder';
import { encodeGameStrategyBoardString } from './encoder';

describe('encoder', () => {
    test('should encode and decode correctly 1', () => {
        const testData = new Uint8Array([1, 2, 3, 4, 5]);
        const encoded = encodeGameStrategyBoardString(testData);
        const decoded = decodeGameStrategyBoardString(encoded);
        expect(decoded).toEqual(testData);
    });

    test('should encode and decode correctly 2', () => {
        const testData =
            '[stgy:aKC4bHfHTH0jkZKVYaKzjs1ra9HfEab5zaQu-bBB2aKodrQvReYpdg-2HcT5MMwWjGhmMVtk9LmJoMYiR4Jre7CFBS4U8-c80CDHZ7D860d-qxBbLleQEBE14fWzY-U6ZZwMkkYmdw8VrmfweS6qq9QNtvGscWBj6K-U-v3+D2yaBQS0olbyAhrmauZH+Uz6Q0stBLxhz5mEMqG2sE117bmogsFpBsQkJhZbwGcSYQzS+88Eq-fAzO2biTx9cPZAABxHNplCeLhwK6tWvNj3OeV0c4c4fg50CInpOuj0+B8NLMpEMZoya-SUEEi5b38nbOaJwmxBn10iVpDK8BnlFYfQtWjTiRUfQfS6gauEWH14uBIKAtvZZOnV7FUrVD1jxzbcYX8CyIcbjYrwMeQaEQI5es+EMtrzi4XV3GgHKVef20FvTtQDGTgkM-5eIk3Ta86N0ZWpIe7Wz2Ll7KndjA]';
        const testDataDecoded = decodeGameStrategyBoardString(testData);
        const encoded = encodeGameStrategyBoardString(testDataDecoded ?? new Uint8Array());
        const decoded = decodeGameStrategyBoardString(encoded);
        expect(decoded).toEqual(testDataDecoded);
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
