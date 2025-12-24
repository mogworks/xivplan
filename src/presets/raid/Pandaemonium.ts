import { ArenaPreset, DEFAULT_ARENA_PADDING, FloorShape, GridType } from '../../scene';
import { SPOKES_45_DEGREES } from '../common';

const PRESET_7: ArenaPreset = {
    name: 'Abyssos: The Seventh Circle',
    background: {
        padding: 50,
    },
    floor: {
        shape: FloorShape.None,
        width: 760,
        height: 700,
    },
    texture: {
        url: '/arena/p7.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_9: ArenaPreset = {
    name: 'Anabaseios: The Ninth Circle',
    background: {
        padding: DEFAULT_ARENA_PADDING - 20,
    },
    floor: {
        shape: FloorShape.Circle,
        width: 650,
        height: 650,
    },
    grid: {
        type: GridType.CustomRadial,
        rings: [125, 225],
        spokes: SPOKES_45_DEGREES,
    },
};

const PRESET_10: ArenaPreset = {
    name: 'Anabaseios: The Tenth Circle',
    background: {
        padding: 50,
    },
    floor: {
        shape: FloorShape.None,
        width: 14 * 60,
        height: 12 * 60,
    },
    texture: {
        url: '/arena/p10.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_10_CENTER: ArenaPreset = {
    name: 'Anabaseios: The Tenth Circle (Center)',
    background: {
        padding: DEFAULT_ARENA_PADDING - 20,
    },
    floor: {
        shape: FloorShape.Rectangle,
        width: 6 * 80,
        height: 8 * 80,
    },
    grid: {
        type: GridType.Rectangular,
        columns: 6,
        rows: 8,
    },
};

const PRESET_11: ArenaPreset = {
    name: 'Anabaseios: The Eleventh Circle',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/p11.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_12: ArenaPreset = {
    name: 'Anabaseios: The Twelfth Circle',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/p12.svg',
    },
    grid: {
        type: GridType.Rectangular,
        rows: 4,
        columns: 2,
    },
};

const PRESET_12_CHECKERBOARD: ArenaPreset = {
    name: 'Anabaseios: The Twelfth Circle (Checkerboard)',
    spoilerFreeName: 'Anabaseios: The Twelfth Circle ████',
    floor: {
        shape: FloorShape.None,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/p12_checker.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_12_CHECKERBOARD_2: ArenaPreset = {
    name: 'Anabaseios: The Twelfth Circle (Checkerboard Mirror)',
    spoilerFreeName: 'Anabaseios: The Twelfth Circle ████',
    floor: {
        shape: FloorShape.None,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/p12_checker2.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_12_OCTAGON: ArenaPreset = {
    name: 'Anabaseios: The Twelfth Circle (Octagon)',
    spoilerFreeName: 'Anabaseios: The Twelfth Circle ████',
    floor: {
        shape: FloorShape.Circle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/p12_octagon.svg',
    },
    grid: {
        type: GridType.CustomRectangular,
        rows: [-225, 0, 225],
        columns: [0],
    },
};

const PRESET_12_PHASE_2: ArenaPreset = {
    name: 'Anabaseios: The Twelfth Circle (Phase 2)',
    spoilerFreeName: 'Anabaseios: The Twelfth Circle ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 450,
    },
    texture: {
        url: '/arena/p12-p2.svg',
    },
    grid: {
        type: GridType.Rectangular,
        rows: 3,
        columns: 2,
    },
};

export const ARENA_PRESETS_RAID_PANDAEMONIUM = [
    PRESET_7,
    PRESET_9,
    PRESET_10,
    PRESET_10_CENTER,
    PRESET_11,
    PRESET_12,
    PRESET_12_CHECKERBOARD,
    PRESET_12_CHECKERBOARD_2,
    PRESET_12_OCTAGON,
    PRESET_12_PHASE_2,
];
