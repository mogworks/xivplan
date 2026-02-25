import { ArenaPreset, FloorShape, GridType } from '../../scene';

const M9S_1: ArenaPreset = {
    key: 'M9S_1',
    name: '1m=10px',
    floor: {
        shape: FloorShape.None,
        width: 400,
        height: 400,
    },
    grid: {
        type: GridType.None,
    },
    texture: {
        url: 'https://cos.xivstrat.cn/floor/07/m9s/1.webp',
        width: 400,
        height: 400,
    },
    isSpoilerFree: true,
};

const M9S_1L: ArenaPreset = {
    key: 'M9S_1L',
    name: '1m=15px',
    floor: {
        shape: FloorShape.None,
        width: 400 * 1.5,
        height: 400 * 1.5,
    },
    grid: {
        type: GridType.None,
    },
    texture: {
        url: 'https://cos.xivstrat.cn/floor/07/m9s/1.webp',
        width: 400 * 1.5,
        height: 400 * 1.5,
    },
    isSpoilerFree: true,
};

const M9S_2: ArenaPreset = {
    key: 'M9S_2',
    name: '1m=10px',
    floor: {
        shape: FloorShape.None,
        width: 200,
        height: 400,
    },
    grid: {
        type: GridType.None,
    },
    texture: {
        url: 'https://cos.xivstrat.cn/floor/07/m9s/2.webp',
        width: 200,
        height: 400,
    },
    background: {
        padding: {
            top: 120,
            bottom: 120,
            left: 220,
            right: 220,
        },
    },
    isSpoilerFree: true,
};

const M9S_2L: ArenaPreset = {
    key: 'M9S_2L',
    name: '1m=15px',
    floor: {
        shape: FloorShape.None,
        width: 200 * 1.5,
        height: 400 * 1.5,
    },
    grid: {
        type: GridType.None,
    },
    texture: {
        url: 'https://cos.xivstrat.cn/floor/07/m9s/2.webp',
        width: 200 * 1.5,
        height: 400 * 1.5,
    },
    background: {
        padding: {
            top: 120,
            bottom: 120,
            left: 270,
            right: 270,
        },
    },
    isSpoilerFree: true,
};

const M9S_3: ArenaPreset = {
    key: 'M9S_3',
    name: '1m=10px',
    floor: {
        shape: FloorShape.None,
        width: 400,
        height: 400,
    },
    grid: {
        type: GridType.None,
    },
    texture: {
        url: 'https://cos.xivstrat.cn/floor/07/m9s/3.webp',
        width: 400,
        height: 400,
    },
    isSpoilerFree: true,
};

const M9S_3L: ArenaPreset = {
    key: 'M9S_3L',
    name: '1m=15px',
    floor: {
        shape: FloorShape.None,
        width: 400 * 1.5,
        height: 400 * 1.5,
    },
    grid: {
        type: GridType.None,
    },
    texture: {
        url: 'https://cos.xivstrat.cn/floor/07/m9s/3.webp',
        width: 400 * 1.5,
        height: 400 * 1.5,
    },
    isSpoilerFree: true,
};

export const ARENA_PRESETS_ARCADION_M9S = [M9S_1, M9S_1L, M9S_2, M9S_2L, M9S_3, M9S_3L];
