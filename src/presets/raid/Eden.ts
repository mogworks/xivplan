import { ArenaPreset, FloorShape, GridType } from '../../scene';

const PRESET_2: ArenaPreset = {
    name: "Eden's Gate: Descent (E2)",
    floor: {
        shape: FloorShape.Rectangle,
        width: 400,
        height: 600,
    },
    grid: {
        type: GridType.Rectangular,
        rows: 6,
        columns: 4,
    },
};

const PRESET_5: ArenaPreset = {
    name: "Eden's Verse: Fulmination (E5)",
    floor: {
        shape: FloorShape.Rectangle,
        width: 860,
        height: 600,
    },
    grid: {
        type: GridType.CustomRectangular,
        rows: [-200, -100, 0, 100, 200],
        columns: [-170, -85, 85, 170],
    },
};

const PRESET_8: ArenaPreset = {
    name: "Eden's Verse: Refulgence (E8)",
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/e8.svg',
    },
    grid: {
        type: GridType.Radial,
        angularDivs: 8,
        radialDivs: 1,
    },
};

const PRESET_11: ArenaPreset = {
    name: "Eden's Promise: Anamorphosis (E11)",
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
};

const PRESET_12: ArenaPreset = {
    name: "Eden's Promise: Eternity (E12)",
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    grid: {
        type: GridType.Radial,
        angularDivs: 16,
        radialDivs: 2,
    },
};

export const ARENA_PRESETS_RAID_EDEN = [PRESET_2, PRESET_5, PRESET_8, PRESET_11, PRESET_12];
