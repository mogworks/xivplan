import { describe, expect, test } from 'vitest';
import type { SBObject, StrategyBoard } from './common';
import { parseStrategyBoardData } from './parser';
import { encodeStrategyBoardData } from './serializer';

describe('serializer', () => {
    function createMockObject(overrides?: Partial<SBObject>): SBObject {
        return {
            id: 1,
            string: undefined,
            flags: {
                visible: true,
                flipHorizontal: false,
                flipVertical: false,
                locked: false,
            },
            coordinates: { x: 512, y: 384 },
            angle: 0,
            scale: 100,
            color: { red: 255, green: 255, blue: 255, opacity: 100 },
            param1: 0,
            param2: 0,
            param3: 0,
            ...overrides,
        };
    }

    function createMockBoard(objects: SBObject[], background: number = 1): StrategyBoard {
        return {
            objects,
            background,
        };
    }

    function compareObjects(original: SBObject, parsed: SBObject) {
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

    test('should encode and decode empty board', () => {
        const board = createMockBoard([]);
        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(0);
        expect(decoded.background).toBe(board.background);
    });

    test('should encode and decode board with single object', () => {
        const obj = createMockObject();
        const board = createMockBoard([obj]);

        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(1);
        compareObjects(obj, decoded.objects[0]!);
        expect(decoded.background).toBe(board.background);
    });

    test('should encode and decode board with multiple objects', () => {
        const obj1 = createMockObject({ id: 1, coordinates: { x: 100, y: 200 } });
        const obj2 = createMockObject({ id: 2, coordinates: { x: 300, y: 400 } });
        const obj3 = createMockObject({ id: 3, coordinates: { x: 500, y: 600 } });

        const board = createMockBoard([obj1, obj2, obj3]);

        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(3);
        compareObjects(obj1, decoded.objects[0]!);
        compareObjects(obj2, decoded.objects[1]!);
        compareObjects(obj3, decoded.objects[2]!);
        expect(decoded.background).toBe(board.background);
    });

    test('should encode and decode text object (id=100)', () => {
        const obj = createMockObject({
            id: 100,
            string: 'Test Text',
        });
        const board = createMockBoard([obj]);

        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(1);
        expect(decoded.objects[0]!.id).toBe(100);
        expect(decoded.objects[0]!.string).toBe('Test Text');
        compareObjects(obj, decoded.objects[0]!);
    });

    test('should encode and decode objects with various flags', () => {
        const obj1 = createMockObject({
            flags: { visible: false, flipHorizontal: false, flipVertical: false, locked: false },
        });
        const obj2 = createMockObject({
            flags: { visible: true, flipHorizontal: true, flipVertical: false, locked: false },
        });
        const obj3 = createMockObject({
            flags: { visible: true, flipHorizontal: false, flipVertical: true, locked: false },
        });
        const obj4 = createMockObject({
            flags: { visible: true, flipHorizontal: false, flipVertical: false, locked: true },
        });
        const obj5 = createMockObject({
            flags: { visible: false, flipHorizontal: true, flipVertical: true, locked: true },
        });

        const board = createMockBoard([obj1, obj2, obj3, obj4, obj5]);

        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(5);
        compareObjects(obj1, decoded.objects[0]!);
        compareObjects(obj2, decoded.objects[1]!);
        compareObjects(obj3, decoded.objects[2]!);
        compareObjects(obj4, decoded.objects[3]!);
        compareObjects(obj5, decoded.objects[4]!);
    });

    test('should encode and decode objects with various colors', () => {
        const obj1 = createMockObject({ color: { red: 255, green: 0, blue: 0, opacity: 100 } });
        const obj2 = createMockObject({ color: { red: 0, green: 255, blue: 0, opacity: 80 } });
        const obj3 = createMockObject({ color: { red: 0, green: 0, blue: 255, opacity: 60 } });
        const obj4 = createMockObject({ color: { red: 128, green: 128, blue: 128, opacity: 40 } });
        const obj5 = createMockObject({ color: { red: 255, green: 255, blue: 255, opacity: 20 } });

        const board = createMockBoard([obj1, obj2, obj3, obj4, obj5]);

        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(5);
        compareObjects(obj1, decoded.objects[0]!);
        compareObjects(obj2, decoded.objects[1]!);
        compareObjects(obj3, decoded.objects[2]!);
        compareObjects(obj4, decoded.objects[3]!);
        compareObjects(obj5, decoded.objects[4]!);
    });

    test('should encode and decode objects with various angles', () => {
        const obj1 = createMockObject({ angle: 0 });
        const obj2 = createMockObject({ angle: 90 });
        const obj3 = createMockObject({ angle: 180 });
        const obj4 = createMockObject({ angle: 270 });
        const obj5 = createMockObject({ angle: 45 });

        const board = createMockBoard([obj1, obj2, obj3, obj4, obj5]);

        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(5);
        compareObjects(obj1, decoded.objects[0]!);
        compareObjects(obj2, decoded.objects[1]!);
        compareObjects(obj3, decoded.objects[2]!);
        compareObjects(obj4, decoded.objects[3]!);
        compareObjects(obj5, decoded.objects[4]!);
    });

    test('should encode and decode objects with various scales', () => {
        const obj1 = createMockObject({ scale: 50 });
        const obj2 = createMockObject({ scale: 100 });
        const obj3 = createMockObject({ scale: 150 });
        const obj4 = createMockObject({ scale: 200 });
        const obj5 = createMockObject({ scale: 255 });

        const board = createMockBoard([obj1, obj2, obj3, obj4, obj5]);

        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(5);
        compareObjects(obj1, decoded.objects[0]!);
        compareObjects(obj2, decoded.objects[1]!);
        compareObjects(obj3, decoded.objects[2]!);
        compareObjects(obj4, decoded.objects[3]!);
        compareObjects(obj5, decoded.objects[4]!);
    });

    test('should encode and decode objects with various params', () => {
        const obj1 = createMockObject({ param1: 100, param2: 200, param3: 300 });
        const obj2 = createMockObject({ param1: 0, param2: 0, param3: 0 });
        const obj3 = createMockObject({ param1: 65535, param2: 65535, param3: 65535 });

        const board = createMockBoard([obj1, obj2, obj3]);

        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(3);
        compareObjects(obj1, decoded.objects[0]!);
        compareObjects(obj2, decoded.objects[1]!);
        compareObjects(obj3, decoded.objects[2]!);
    });

    test('should encode and decode board with different backgrounds', () => {
        const obj = createMockObject();

        for (let bg = 1; bg <= 10; bg++) {
            const board = createMockBoard([obj], bg);
            const encoded = encodeStrategyBoardData(board);
            const decoded = parseStrategyBoardData(encoded);

            expect(decoded.background).toBe(bg);
            compareObjects(obj, decoded.objects[0]!);
        }
    });

    test('should handle round-trip encoding and decoding', () => {
        const obj1 = createMockObject({
            id: 100,
            string: 'Hello World',
            flags: { visible: true, flipHorizontal: true, flipVertical: false, locked: true },
            coordinates: { x: 256, y: 192 },
            angle: 45,
            scale: 120,
            color: { red: 200, green: 150, blue: 100, opacity: 75 },
            param1: 42,
            param2: 84,
            param3: 126,
        });

        const obj2 = createMockObject({
            id: 1,
            flags: { visible: false, flipHorizontal: false, flipVertical: true, locked: false },
            coordinates: { x: 768, y: 576 },
            angle: 270,
            scale: 80,
            color: { red: 50, green: 100, blue: 150, opacity: 90 },
            param1: 1000,
            param2: 2000,
            param3: 3000,
        });

        const originalBoard = createMockBoard([obj1, obj2], 5);

        const encoded1 = encodeStrategyBoardData(originalBoard);
        const decoded1 = parseStrategyBoardData(encoded1);
        const encoded2 = encodeStrategyBoardData(decoded1);
        const decoded2 = parseStrategyBoardData(encoded2);

        expect(decoded1.objects).toHaveLength(2);
        expect(decoded2.objects).toHaveLength(2);

        compareObjects(decoded1.objects[0]!, decoded2.objects[0]!);
        compareObjects(decoded1.objects[1]!, decoded2.objects[1]!);
        expect(decoded1.background).toBe(decoded2.background);
    });

    test('should encode and decode complex board with mixed objects', () => {
        const objects: SBObject[] = [
            createMockObject({
                id: 100,
                string: 'Tank',
                flags: { visible: true, flipHorizontal: false, flipVertical: false, locked: false },
                coordinates: { x: 100, y: 100 },
                angle: 0,
                scale: 100,
                color: { red: 0, green: 255, blue: 0, opacity: 100 },
                param1: 0,
                param2: 0,
                param3: 0,
            }),
            createMockObject({
                id: 100,
                string: 'Healer',
                flags: { visible: true, flipHorizontal: false, flipVertical: false, locked: false },
                coordinates: { x: 200, y: 200 },
                angle: 0,
                scale: 100,
                color: { red: 0, green: 255, blue: 255, opacity: 100 },
                param1: 0,
                param2: 0,
                param3: 0,
            }),
            createMockObject({
                id: 1,
                flags: { visible: true, flipHorizontal: false, flipVertical: false, locked: false },
                coordinates: { x: 512, y: 384 },
                angle: 30,
                scale: 150,
                color: { red: 255, green: 0, blue: 0, opacity: 80 },
                param1: 100,
                param2: 200,
                param3: 300,
            }),
            createMockObject({
                id: 2,
                flags: { visible: false, flipHorizontal: true, flipVertical: true, locked: true },
                coordinates: { x: 800, y: 600 },
                angle: 180,
                scale: 75,
                color: { red: 128, green: 128, blue: 128, opacity: 50 },
                param1: 500,
                param2: 600,
                param3: 700,
            }),
        ];

        const board = createMockBoard(objects, 3);

        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(4);
        for (let i = 0; i < objects.length; i++) {
            compareObjects(objects[i]!, decoded.objects[i]!);
        }
        expect(decoded.background).toBe(board.background);
    });

    test('should handle objects at edge coordinates', () => {
        const obj1 = createMockObject({ coordinates: { x: 0, y: 0 } });
        const obj2 = createMockObject({ coordinates: { x: 1024, y: 768 } });
        const obj3 = createMockObject({ coordinates: { x: 512, y: 384 } });

        const board = createMockBoard([obj1, obj2, obj3]);

        const encoded = encodeStrategyBoardData(board);
        const decoded = parseStrategyBoardData(encoded);

        expect(decoded.objects).toHaveLength(3);
        compareObjects(obj1, decoded.objects[0]!);
        compareObjects(obj2, decoded.objects[1]!);
        compareObjects(obj3, decoded.objects[2]!);
    });
});
