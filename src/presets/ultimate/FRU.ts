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
        url: '/arena/e11.svg',
    },
    grid: {
        type: GridType.Radial,
        angularDivs: 8,
        radialDivs: 1,
    },
    ticks: DEFAULT_RADIAL_TICKS,
};

export const ARENA_PRESETS_ULTIMATE_FRU = [PRESET_1];
