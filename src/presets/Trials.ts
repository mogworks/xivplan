import { ArenaPreset, FloorShape, GridType } from '../scene';

const PRESET_DIAMOND_WEAPON_1: ArenaPreset = {
    name: 'The Cloud Deck',
    floor: {
        shape: FloorShape.None,
        width: 800,
        height: 600,
    },
    texture: {
        url: '/arena/cloud-deck.svg',
    },
    grid: { type: GridType.None },
};

const PRESET_DIAMOND_WEAPON_2: ArenaPreset = {
    name: 'The Cloud Deck (Half)',
    floor: {
        shape: FloorShape.Rectangle,
        width: 300,
        height: 600,
    },
    grid: { type: GridType.Rectangular, rows: 5, columns: 2 },
};

const PRESET_EVERKEEP: ArenaPreset = {
    name: 'Everkeep (Dawn of an Age)',
    spoilerFreeName: 'Dawntrail Trial 2',
    background: {
        padding: 100,
    },
    floor: {
        shape: FloorShape.None,
        width: 300,
        height: 650,
    },
    texture: {
        url: '/arena/everkeep.svg',
    },
    grid: { type: GridType.None },
};

export const ARENA_PRESETS_TRIALS = [PRESET_DIAMOND_WEAPON_1, PRESET_DIAMOND_WEAPON_2, PRESET_EVERKEEP];
