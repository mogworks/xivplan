import { ArenaPreset, FloorShape, GridType } from '../../../scene';

const PRESET_3: ArenaPreset = {
    name: 'Phase 3',
    spoilerFreeName: 'Phase ██',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/ucob-p3.png',
        opacity: 50,
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
        url: '/arena/ucob-p4.png',
        opacity: 50,
    },
    grid: { type: GridType.None },
};

export const ARENA_PRESETS_ULTIMATE_UCOB = [PRESET_3, PRESET_4];
