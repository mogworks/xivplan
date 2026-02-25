import { ArenaPreset } from '../scene';
import { ARENA_PRESETS_ARCADION_M10S } from './arcadion/m10s';
import { ARENA_PRESETS_ARCADION_M11S } from './arcadion/m11s';
import { ARENA_PRESETS_ARCADION_M12S } from './arcadion/m12s';
import { ARENA_PRESETS_ARCADION_M9S } from './arcadion/m9s';

export const ARENA_PRESETS: Record<string, Record<string, ArenaPreset[]>> = {
    '阿卡狄亚 · 重量级': {
        M9S: ARENA_PRESETS_ARCADION_M9S,
        M10S: ARENA_PRESETS_ARCADION_M10S,
        M11S: ARENA_PRESETS_ARCADION_M11S,
        M12S: ARENA_PRESETS_ARCADION_M12S,
    },
    // '': {
    //     General: ARENA_PRESETS_GENERAL,
    //     Criterion: ARENA_PRESETS_CRITERION,
    //     Trials: ARENA_PRESETS_TRIALS,
    // },
    // Raids: {
    //     Eden: ARENA_PRESETS_RAID_EDEN,
    //     Pandæmonium: ARENA_PRESETS_RAID_PANDAEMONIUM,
    //     Arcadion: ARENA_PRESETS_RAID_ARCADION,
    // },
    // Ultimate: {
    //     'Unending Coil': ARENA_PRESETS_ULTIMATE_UCOB,
    //     "The Weapon's Refrain": ARENA_PRESETS_ULTIMATE_UWU,
    //     'The Epic of Alexander': ARENA_PRESETS_ULTIMATE_TEA,
    //     "Dragonsong's Reprise": ARENA_PRESETS_ULTIMATE_DSU,
    //     'The Omega Protocol': ARENA_PRESETS_ULTIMATE_TOP,
    //     'Futures Rewritten': ARENA_PRESETS_ULTIMATE_FRU,
    // },
};
