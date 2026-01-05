import { ArenaPreset, FloorShape, GridType } from '../../scene';

const PRESET_ZELESS_GAH: ArenaPreset = {
    name: "Sil'dihn Subterrane: Shadowcaster Zeless Gah",
    spoilerFreeName: "Sil'dihn Subterrane: Final Boss",
    floor: {
        shape: FloorShape.Rectangle,
        width: 450,
        height: 600,
    },
    grid: {
        type: GridType.Rectangular,
        rows: 4,
        columns: 3,
    },
};

export const ARENA_PRESETS_CRITERION = [PRESET_ZELESS_GAH];
