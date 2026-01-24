import { ArenaPreset, FloorShape, GridType } from '../../../scene';

const PRESET_3A: ArenaPreset = {
    name: 'Phase 3a',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/uwu-p3a.png',
        opacity: 35,
    },
    grid: { type: GridType.Radial, angularDivs: 8, radialDivs: 1 },
};

const PRESET_3B: ArenaPreset = {
    name: 'Phase 3b',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/uwu-p3b.png',
        opacity: 35,
    },
    grid: { type: GridType.Radial, angularDivs: 8, radialDivs: 1 },
};

const PRESET_3C: ArenaPreset = {
    name: 'Phase 3c',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/uwu-p3c.png',
        opacity: 35,
    },
    grid: { type: GridType.Radial, angularDivs: 8, radialDivs: 1 },
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
        url: '/arena/uwu-p5.png',
        opacity: 35,
    },
    grid: { type: GridType.None },
};

export const ARENA_PRESETS_ULTIMATE_UWU = [PRESET_3A, PRESET_3B, PRESET_3C, PRESET_5];
