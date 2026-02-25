import { ArenaPreset, FloorShape, GridType } from '../../../scene';

const PRESET_2: ArenaPreset = {
    name: 'AAC Light-heavyweight M2',
    background: {
        padding: 20,
    },
    floor: {
        shape: FloorShape.Circle,
        width: 800,
        height: 800,
    },
    texture: {
        url: '/arena/arcadion2.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_3: ArenaPreset = {
    name: 'AAC Light-heavyweight M3',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/arcadion3.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_4: ArenaPreset = {
    name: 'AAC Light-heavyweight M4',
    spoilerFreeName: 'AAC Light-heavyweight M4 ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/arcadion4.svg',
    },
    grid: { type: GridType.Rectangular, rows: 4, columns: 4 },
};

const PRESET_4_PHASE_2: ArenaPreset = {
    name: 'AAC Light-heavyweight M4 (Phase 2)',
    spoilerFreeName: 'AAC Light-heavyweight M4 ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 450,
    },
    texture: {
        url: '/arena/arcadion4-p2.svg',
    },
    grid: { type: GridType.Rectangular, rows: 3, columns: 4 },
};

const PRESET_6: ArenaPreset = {
    name: 'AAC Cruiserweight M2',
    spoilerFreeName: 'AAC Cruiserweight M2 ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/arcadion6.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_6_QUICKSAND: ArenaPreset = {
    name: 'AAC Cruiserweight M2 (Quicksand)',
    spoilerFreeName: 'AAC Cruiserweight M2 ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/arcadion6-quicksand.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_6_QUICKSAND_2: ArenaPreset = {
    name: 'AAC Cruiserweight M2 (Quicksand 2)',
    spoilerFreeName: 'AAC Cruiserweight M2 ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/arcadion6-quicksand2.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_6_RIVER: ArenaPreset = {
    name: 'AAC Cruiserweight M2 (Riverscape)',
    spoilerFreeName: 'AAC Cruiserweight M2 ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/arcadion6-river.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_6_VOLCANO: ArenaPreset = {
    name: 'AAC Cruiserweight M2 (Volcano)',
    spoilerFreeName: 'AAC Cruiserweight M2 ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/arcadion6-volcano.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_7: ArenaPreset = {
    name: 'AAC Cruiserweight M3',
    spoilerFreeName: 'AAC Cruiserweight M3 ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/arcadion7.svg',
    },
    grid: { type: GridType.Rectangular, rows: 4, columns: 4 },
};

const PRESET_7_PHASE_2: ArenaPreset = {
    name: 'AAC Cruiserweight M3 (Phase 2)',
    spoilerFreeName: 'AAC Cruiserweight M3 ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 300,
        height: 600,
    },
    texture: {
        url: '/arena/arcadion7-p2.svg',
    },
    grid: { type: GridType.CustomRectangular, rows: [-150, 150], columns: [0] },
};

const PRESET_7_PHASE_3: ArenaPreset = {
    name: 'AAC Cruiserweight M3 (Phase 3)',
    spoilerFreeName: 'AAC Cruiserweight M3 ████',
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    texture: {
        url: '/arena/arcadion7-p3.svg',
    },
    grid: { type: GridType.Rectangular, rows: 8, columns: 8 },
};

const PRESET_8: ArenaPreset = {
    name: 'AAC Cruiserweight M4',
    spoilerFreeName: 'AAC Cruiserweight M4 ████',
    background: {
        padding: 20,
    },
    floor: {
        shape: FloorShape.Circle,
        width: 800,
        height: 800,
    },
    texture: {
        url: '/arena/arcadion8.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_8_PHASE_2: ArenaPreset = {
    name: 'AAC Cruiserweight M4 (Phase 2)',
    spoilerFreeName: 'AAC Cruiserweight M4 ████',
    floor: {
        shape: FloorShape.Circle,
        width: 580,
        height: 580,
    },
    texture: {
        url: '/arena/arcadion8-p2.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_8_SAVAGE_PHASE_2: ArenaPreset = {
    name: 'AAC Cruiserweight M4 (Savage Phase 2)',
    spoilerFreeName: 'AAC Cruiserweight M4 ████',
    background: {
        padding: 0,
    },
    floor: {
        shape: FloorShape.None,
        width: 840,
        height: 840,
    },
    texture: {
        url: '/arena/arcadion8-sp2.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_8_SAVAGE_PHASE_2_MIRROR: ArenaPreset = {
    name: 'AAC Cruiserweight M4 (Savage Phase 2 Mirror)',
    spoilerFreeName: 'AAC Cruiserweight M4 ████',
    background: {
        padding: 0,
    },
    floor: {
        shape: FloorShape.None,
        width: 840,
        height: 840,
    },
    texture: {
        url: '/arena/arcadion8-sp2-mirror.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_11: ArenaPreset = {
    name: 'AAC Heavyweight M3',
    spoilerFreeName: 'AAC Heavyweight M3 ████',
    background: {
        padding: 100,
    },
    floor: {
        shape: FloorShape.Rectangle,
        width: 640,
        height: 640,
    },
    texture: {
        url: '/arena/arcadion11.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_11_SPLIT: ArenaPreset = {
    name: 'AAC Heavyweight M3 (Split)',
    spoilerFreeName: 'AAC Heavyweight M3 ████',
    background: {
        padding: 100,
    },
    floor: {
        shape: FloorShape.Rectangle,
        width: 820,
        height: 640,
    },
    texture: {
        url: '/arena/arcadion11-split-v2.svg',
    },
    grid: { type: GridType.None },
};

export const ARENA_PRESETS_RAID_ARCADION = [
    PRESET_2,
    PRESET_3,
    PRESET_4,
    PRESET_4_PHASE_2,
    PRESET_6,
    PRESET_6_QUICKSAND,
    PRESET_6_QUICKSAND_2,
    PRESET_6_RIVER,
    PRESET_6_VOLCANO,
    PRESET_7,
    PRESET_7_PHASE_2,
    PRESET_7_PHASE_3,
    PRESET_8,
    PRESET_8_PHASE_2,
    PRESET_8_SAVAGE_PHASE_2,
    PRESET_8_SAVAGE_PHASE_2_MIRROR,
    PRESET_11,
    PRESET_11_SPLIT,
];
