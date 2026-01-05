import { assert, expect } from 'vitest';
import { decodeGameStrategyBoardString } from './decoder';
import { encodeGameStrategyBoardString } from './encoder';
import { parseStrategyBoardData } from './parser';
import { encodeStrategyBoardData } from './serializer';

describe('encoder', () => {
    test('should encode and decode correctly', () => {
        const testData = new Uint8Array([1, 2, 3, 4, 5]);
        let encoded = encodeGameStrategyBoardString(testData);
        let decoded = decodeGameStrategyBoardString(encoded);
        expect(decoded).toEqual(testData);

        const shareString =
            '[stgy:aKC4bHfHTH0jkZKVYaKzjs1ra9HfEab5zaQu-bBB2aKodrQvReYpdg-2HcT5MMwWjGhmMVtk9LmJoMYiR4Jre7CFBS4U8-c80CDHZ7D860d-qxBbLleQEBE14fWzY-U6ZZwMkkYmdw8VrmfweS6qq9QNtvGscWBj6K-U-v3+D2yaBQS0olbyAhrmauZH+Uz6Q0stBLxhz5mEMqG2sE117bmogsFpBsQkJhZbwGcSYQzS+88Eq-fAzO2biTx9cPZAABxHNplCeLhwK6tWvNj3OeV0c4c4fg50CInpOuj0+B8NLMpEMZoya-SUEEi5b38nbOaJwmxBn10iVpDK8BnlFYfQtWjTiRUfQfS6gauEWH14uBIKAtvZZOnV7FUrVD1jxzbcYX8CyIcbjYrwMeQaEQI5es+EMtrzi4XV3GgHKVef20FvTtQDGTgkM-5eIk3Ta86N0ZWpIe7Wz2Ll7KndjA]';
        const shareStringDecoded = decodeGameStrategyBoardString(shareString);
        encoded = encodeGameStrategyBoardString(shareStringDecoded ?? new Uint8Array());
        decoded = decodeGameStrategyBoardString(encoded);
        expect(decoded).toEqual(shareStringDecoded);
    });

    test('should handle different seeds', () => {
        const testData = new Uint8Array([10, 20, 30, 40, 50]);
        for (let seed = 0; seed < 64; seed++) {
            const encoded = encodeGameStrategyBoardString(testData, seed);
            const decoded = decodeGameStrategyBoardString(encoded);
            expect(decoded).toEqual(testData);
        }
    });

    test('should round-trip real strategy board data', () => {
        const shareString =
            '[stgy:aKC4bHfHTH0jkZKVYaKzjs1ra9HfEab5zaQu-bBB2aKodrQvReYpdg-2HcT5MMwWjGhmMVtk9LmJoMYiR4Jre7CFBS4U8-c80CDHZ7D860d-qxBbLleQEBE14fWzY-U6ZZwMkkYmdw8VrmfweS6qq9QNtvGscWBj6K-U-v3+D2yaBQS0olbyAhrmauZH+Uz6Q0stBLxhz5mEMqG2sE117bmogsFpBsQkJhZbwGcSYQzS+88Eq-fAzO2biTx9cPZAABxHNplCeLhwK6tWvNj3OeV0c4c4fg50CInpOuj0+B8NLMpEMZoya-SUEEi5b38nbOaJwmxBn10iVpDK8BnlFYfQtWjTiRUfQfS6gauEWH14uBIKAtvZZOnV7FUrVD1jxzbcYX8CyIcbjYrwMeQaEQI5es+EMtrzi4XV3GgHKVef20FvTtQDGTgkM-5eIk3Ta86N0ZWpIe7Wz2Ll7KndjA]';

        const decoded = decodeGameStrategyBoardString(shareString);
        expect(decoded).not.toBeNull();

        const strategyBoard = parseStrategyBoardData(decoded!);
        expect(strategyBoard).toBeDefined();
        expect(strategyBoard.objects.length).toBeGreaterThan(0);

        const reencoded = encodeStrategyBoardData(strategyBoard);
        const reencodedShareString = encodeGameStrategyBoardString(reencoded);
        const redecoded = decodeGameStrategyBoardString(reencodedShareString);

        expect(redecoded).not.toBeNull();
        const redecodedStrategyBoard = parseStrategyBoardData(redecoded!);

        expect(redecodedStrategyBoard.objects.length).toBe(strategyBoard.objects.length);
        expect(redecodedStrategyBoard.background).toBe(strategyBoard.background);

        for (let i = 0; i < strategyBoard.objects.length; i++) {
            const original = strategyBoard.objects[i];
            const parsed = redecodedStrategyBoard.objects[i];

            assert(parsed !== undefined);
            assert(original !== undefined);

            expect(parsed.id).toBe(original.id);
            expect(parsed.string).toBe(original.string);
            expect(parsed.flags.visible).toBe(original.flags.visible);
            expect(parsed.flags.flipHorizontal).toBe(original.flags.flipHorizontal);
            expect(parsed.flags.flipVertical).toBe(original.flags.flipVertical);
            expect(parsed.flags.locked).toBe(original.flags.locked);
            expect(parsed.color.red).toBe(original.color.red);
            expect(parsed.color.green).toBe(original.color.green);
            expect(parsed.color.blue).toBe(original.color.blue);
            expect(parsed.color.opacity).toBe(original.color.opacity);
            expect(parsed.param1).toBe(original.param1);
            expect(parsed.param2).toBe(original.param2);
            expect(parsed.param3).toBe(original.param3);
            expect(parsed.angle).toBe(original.angle);
            expect(parsed.scale).toBe(original.scale);
            expect(parsed.coordinates.x).toBe(original.coordinates.x);
            expect(parsed.coordinates.y).toBe(original.coordinates.y);
        }
    });

    test('should preserve binary data integrity', () => {
        const shareString =
            '[stgy:aKC4bHfHTH0jkZKVYaKzjs1ra9HfEab5zaQu-bBB2aKodrQvReYpdg-2HcT5MMwWjGhmMVtk9LmJoMYiR4Jre7CFBS4U8-c80CDHZ7D860d-qxBbLleQEBE14fWzY-U6ZZwMkkYmdw8VrmfweS6qq9QNtvGscWBj6K-U-v3+D2yaBQS0olbyAhrmauZH+Uz6Q0stBLxhz5mEMqG2sE117bmogsFpBsQkJhZbwGcSYQzS+88Eq-fAzO2biTx9cPZAABxHNplCeLhwK6tWvNj3OeV0c4c4fg50CInpOuj0+B8NLMpEMZoya-SUEEi5b38nbOaJwmxBn10iVpDK8BnlFYfQtWjTiRUfQfS6gauEWH14uBIKAtvZZOnV7FUrVD1jxzbcYX8CyIcbjYrwMeQaEQI5es+EMtrzi4XV3GgHKVef20FvTtQDGTgkM-5eIk3Ta86N0ZWpIe7Wz2Ll7KndjA]';

        const decoded1 = decodeGameStrategyBoardString(shareString);
        expect(decoded1).not.toBeNull();

        const encoded1 = encodeGameStrategyBoardString(decoded1!);
        const decoded2 = decodeGameStrategyBoardString(encoded1);
        expect(decoded2).toEqual(decoded1);

        const encoded2 = encodeGameStrategyBoardString(decoded2!);
        const decoded3 = decodeGameStrategyBoardString(encoded2);
        expect(decoded3).toEqual(decoded1);
    });

    test('should handle multiple round trips', () => {
        const shareString =
            '[stgy:aKC4bHfHTH0jkZKVYaKzjs1ra9HfEab5zaQu-bBB2aKodrQvReYpdg-2HcT5MMwWjGhmMVtk9LmJoMYiR4Jre7CFBS4U8-c80CDHZ7D860d-qxBbLleQEBE14fWzY-U6ZZwMkkYmdw8VrmfweS6qq9QNtvGscWBj6K-U-v3+D2yaBQS0olbyAhrmauZH+Uz6Q0stBLxhz5mEMqG2sE117bmogsFpBsQkJhZbwGcSYQzS+88Eq-fAzO2biTx9cPZAABxHNplCeLhwK6tWvNj3OeV0c4c4fg50CInpOuj0+B8NLMpEMZoya-SUEEi5b38nbOaJwmxBn10iVpDK8BnlFYfQtWjTiRUfQfS6gauEWH14uBIKAtvZZOnV7FUrVD1jxzbcYX8CyIcbjYrwMeQaEQI5es+EMtrzi4XV3GgHKVef20FvTtQDGTgkM-5eIk3Ta86N0ZWpIe7Wz2Ll7KndjA]';

        let current = shareString;
        const originalDecoded = decodeGameStrategyBoardString(current);
        expect(originalDecoded).not.toBeNull();

        for (let i = 0; i < 10; i++) {
            const decoded = decodeGameStrategyBoardString(current);
            expect(decoded).toEqual(originalDecoded);

            const encoded = encodeGameStrategyBoardString(decoded!);
            current = encoded;
        }
    });
});
