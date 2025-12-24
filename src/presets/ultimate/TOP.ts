import { ArenaPreset, DEFAULT_RADIAL_TICKS, FloorShape, GridType } from '../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/top-p1.png',
        opacity: 50,
    },
    grid: { type: GridType.None },
    ticks: DEFAULT_RADIAL_TICKS,
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
        url: '/arena/top-p2.png',
        opacity: 35,
    },
    grid: { type: GridType.None },
    ticks: DEFAULT_RADIAL_TICKS,
};

export const ARENA_PRESETS_ULTIMATE_TOP = [PRESET_1, PRESET_2];
