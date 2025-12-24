import { ArenaPreset, FloorShape, GridType, Ticks, TickType } from '../../scene';

const RADIAL_TICKS: Ticks = {
    type: TickType.Radial,
    majorStart: 0,
    majorCount: 8,
    minorStart: 0,
    minorCount: 89,
};

const RECT_TICKS: Ticks = {
    type: TickType.Rectangular,
    columns: 30,
    rows: 30,
};

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/dsu-p1.png',
        opacity: 35,
    },
    grid: { type: GridType.None },
    ticks: RECT_TICKS,
};

const PRESET_2A: ArenaPreset = {
    name: 'Phase 2a',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/dsu-p2a.png',
        opacity: 35,
    },
    grid: { type: GridType.None },
    ticks: RADIAL_TICKS,
};

const PRESET_2B: ArenaPreset = {
    name: 'Phase 2b',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/dsu-p2b.png',
        opacity: 35,
    },
    grid: { type: GridType.None },
    ticks: RADIAL_TICKS,
};

const PRESET_3: ArenaPreset = {
    name: 'Phase 3',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/dsu-p3.png',
        opacity: 25,
    },
    grid: { type: GridType.Rectangular, rows: 4, columns: 4 },
    ticks: RECT_TICKS,
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
        url: '/arena/dsu-p4.png',
        opacity: 50,
    },
    grid: { type: GridType.None },
    ticks: RADIAL_TICKS,
};

const PRESET_5: ArenaPreset = {
    name: 'Phase 5',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/dsu-p5.png',
        opacity: 35,
    },
    grid: { type: GridType.None },
    ticks: RADIAL_TICKS,
};

export const ARENA_PRESETS_ULTIMATE_DSU = [PRESET_1, PRESET_2A, PRESET_2B, PRESET_3, PRESET_4, PRESET_5];
