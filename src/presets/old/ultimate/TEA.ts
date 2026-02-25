import { ArenaPreset, FloorShape, GridType } from '../../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/tea-p1.png',
        opacity: 35,
    },
    grid: { type: GridType.None },
};

const PRESET_2: ArenaPreset = {
    name: 'Phase 2',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/tea-p2.png',
        opacity: 50,
    },
    grid: { type: GridType.None },
};

const PRESET_3: ArenaPreset = {
    name: 'Phase 3',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/tea-p3.png',
        opacity: 35,
    },
    grid: { type: GridType.None },
};

const PRESET_4: ArenaPreset = {
    name: 'Phase 4',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/tea-p4.png',
        opacity: 35,
    },
    grid: { type: GridType.None },
};

export const ARENA_PRESETS_ULTIMATE_TEA = [PRESET_1, PRESET_2, PRESET_3, PRESET_4];
