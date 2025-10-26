export interface JobProps {
    defaultNameKey: string; // i18n key
    icon: string;
}

export enum Job {
    RoleAny,
    RoleTank,
    RoleHealer,
    RoleSupport,
    RoleDps,
    RoleMelee,
    RoleRanged,
    RoleMagicRanged,
    RolePhysicalRanged,
    Paladin,
    Warrior,
    DarkKnight,
    Gunbreaker,
    WhiteMage,
    Scholar,
    Astrologian,
    Monk,
    Dragoon,
    Ninja,
    Viper,
    Reaper,
    Sage,
    Samurai,
    Bard,
    Machinist,
    Dancer,
    BlackMage,
    Summoner,
    RedMage,
    Pictomancer,
    BlueMage,
}

const JOBS: Record<Job, JobProps> = {
    [Job.RoleAny]: { defaultNameKey: 'jobs.roleAny', icon: 'any.png' },
    [Job.RoleTank]: { defaultNameKey: 'jobs.roleTank', icon: 'tank.png' },
    [Job.RoleHealer]: { defaultNameKey: 'jobs.roleHealer', icon: 'healer.png' },
    [Job.RoleSupport]: { defaultNameKey: 'jobs.roleSupport', icon: 'support.png' },
    [Job.RoleDps]: { defaultNameKey: 'jobs.roleDps', icon: 'dps.png' },
    [Job.RoleMelee]: { defaultNameKey: 'jobs.roleMelee', icon: 'melee.png' },
    [Job.RoleRanged]: { defaultNameKey: 'jobs.roleRanged', icon: 'ranged.png' },
    [Job.RoleMagicRanged]: { defaultNameKey: 'jobs.roleMagicRanged', icon: 'magic_ranged.png' },
    [Job.RolePhysicalRanged]: { defaultNameKey: 'jobs.rolePhysicalRanged', icon: 'physical_ranged.png' },
    [Job.Paladin]: { defaultNameKey: 'jobs.paladin', icon: 'PLD.png' },
    [Job.Warrior]: { defaultNameKey: 'jobs.warrior', icon: 'WAR.png' },
    [Job.DarkKnight]: { defaultNameKey: 'jobs.darkKnight', icon: 'DRK.png' },
    [Job.Gunbreaker]: { defaultNameKey: 'jobs.gunbreaker', icon: 'GNB.png' },
    [Job.WhiteMage]: { defaultNameKey: 'jobs.whiteMage', icon: 'WHM.png' },
    [Job.Scholar]: { defaultNameKey: 'jobs.scholar', icon: 'SCH.png' },
    [Job.Astrologian]: { defaultNameKey: 'jobs.astrologian', icon: 'AST.png' },
    [Job.Sage]: { defaultNameKey: 'jobs.sage', icon: 'SGE.png' },
    [Job.Monk]: { defaultNameKey: 'jobs.monk', icon: 'MNK.png' },
    [Job.Dragoon]: { defaultNameKey: 'jobs.dragoon', icon: 'DRG.png' },
    [Job.Ninja]: { defaultNameKey: 'jobs.ninja', icon: 'NIN.png' },
    [Job.Viper]: { defaultNameKey: 'jobs.viper', icon: 'VPR.png' },
    [Job.Reaper]: { defaultNameKey: 'jobs.reaper', icon: 'RPR.png' },
    [Job.Samurai]: { defaultNameKey: 'jobs.samurai', icon: 'SAM.png' },
    [Job.Bard]: { defaultNameKey: 'jobs.bard', icon: 'BRD.png' },
    [Job.Machinist]: { defaultNameKey: 'jobs.machinist', icon: 'MCH.png' },
    [Job.Dancer]: { defaultNameKey: 'jobs.dancer', icon: 'DNC.png' },
    [Job.BlackMage]: { defaultNameKey: 'jobs.blackMage', icon: 'BLM.png' },
    [Job.Summoner]: { defaultNameKey: 'jobs.summoner', icon: 'SMN.png' },
    [Job.RedMage]: { defaultNameKey: 'jobs.redMage', icon: 'RDM.png' },
    [Job.Pictomancer]: { defaultNameKey: 'jobs.pictomancer', icon: 'PCT.png' },
    [Job.BlueMage]: { defaultNameKey: 'jobs.blueMage', icon: 'BLU.png' },
};

export function getJob(job: Job): JobProps {
    const props = JOBS[job];
    if (props === undefined) {
        throw new Error('Unknown job');
    }

    return props;
}

export function getJobIconUrl(icon: string): string {
    return `/actor/${icon}`;
}
