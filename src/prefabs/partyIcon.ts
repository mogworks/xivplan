// game strategy board icons: `board/objects/${iconId}.webp`
export enum PartyIcon {
    GLA = 18, // 剑术
    PGL, // 格斗
    MRD, // 斧术
    LNC, // 枪术
    ARC, // 弓箭
    CNJ, // 幻术
    THM, // 咒术
    ACN, // 秘术
    ROG, // 双剑
    PLD, // 骑士
    MNK, // 武僧
    WAR, // 战士
    DRG, // 龙骑
    BRD, // 诗人
    WHM, // 白魔
    BLM, // 黑魔
    SMN, // 召唤
    SCH, // 学者
    NIN, // 忍者
    MCH, // 机工
    DRK, // 暗骑
    AST, // 占星
    SAM, // 武士
    RDM, // 赤魔
    BLU, // 青魔
    GNB, // 绝枪
    DNC, // 舞者
    RPR, // 钐镰
    SGE, // 贤者
    Tank,
    Tank1,
    Tank2,
    Healer,
    Healer1,
    Healer2,
    DPS,
    Melee1,
    Melee2,
    Ranged1,
    Ranged2,
    VPR = 101, // 蝰蛇
    PCT, // 画家
    Melee = 118,
    Ranged,
    PhysicalRanged,
    MagicalRanged,
    PureHealer,
    BarrierHealer,
}

const EXTRA_ICON_ID_BASE = 1000000;

// extra icons: `board/extra/party/${iconId - EXTRA_ICON_ID_BASE}.png`
export enum ExtraPartyIcon {
    Any = 1000001,
    AllRole,
    TH,
    TD,
    HD,
    DPS1 = 1000054,
    DPS2,
    DPS3,
    DPS4,
}

export const PartyIcons = { ...PartyIcon, ...ExtraPartyIcon } as const;

export const getPartyIconUrl = (iconId: number) =>
    iconId < EXTRA_ICON_ID_BASE
        ? new URL(`board/objects/${iconId}.webp`, import.meta.env.VITE_COS_URL).href
        : new URL(`board/extra/party/${iconId - EXTRA_ICON_ID_BASE}.webp`, import.meta.env.VITE_COS_URL).href;
