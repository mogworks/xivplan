// copy & modify from https://github.com/Ennea/ffxiv-strategy-board-viewer/blob/master/draw.ts

import Color from 'colorjs.io';
import {
    getWaymarkIdByType,
    getWaymarkOffsetsFromGroup,
    getWaymarkTypeById,
    WaymarkId,
} from '../../prefabs/waymarkIcon';
import { LayerName } from '../../render/layers';
import {
    AoeArcObject,
    AoeCircleObject,
    AoeDonutObject,
    AoeFanObject,
    AoeRectObject,
    ArrowObject,
    BoardIconObject,
    CircleZone,
    EnemyObject,
    FloorShape,
    IndicatorLineStackObject,
    IndicatorMarkerObject,
    IndicatorProximityObject,
    IndicatorStackObject,
    IndicatorTankbusterObject,
    IndicatorTargetingObject,
    isAoeObject,
    isHorizontalFlippable,
    isMovable,
    isVerticalFlippable,
    MechCircleExaflareObject,
    MechCounterTowerObject,
    MechGazeObject,
    MechLinearKnockbackObject,
    MechProximityObject,
    MechRadialKnockbackObject,
    MechRotationObject,
    MechTowerObject,
    ObjectType,
    PartyObject,
    RectangleZone,
    Scene,
    SceneObject,
    SceneObjectWithoutId,
    TextObject,
    WaymarkGroupObject,
    WaymarkObject,
} from '../../scene';
import { DEFAULT_AOE_COLOR } from '../../theme';
import { SBObject } from './common';
import { encodeShareString } from './encoder';
import { getObjectSize, knownObjects, objectScaleFactor } from './objects';
import { parseStrategyBoardData } from './parser';
import { buildStrategyBoardData } from './serializer';

const BASE_URL = 'https://cos.xivstrat.cn';
const CANVAS_DESIGN_WIDTH = 5120; // game strategy board canvas design width
const CANVAS_GAME_WIDTH = 1024; // game strategy board canvas actual width
const SCENE_WIDTH = 640;
const SCENE_HEIGHT = 480;
const SIZE_FACTOR = SCENE_WIDTH / CANVAS_GAME_WIDTH;
const POS_FACTOR = SCENE_WIDTH / CANVAS_DESIGN_WIDTH;

// const BOARD_COLORS = [
//     '#ffffff',
//     '#ffbdbf',
//     '#ffe0c8',
//     '#fff8b0',
//     '#e9ffe2',
//     '#e8fffe',
//     '#9cd0f4',
//     '#ffdcff',
//     '#f8f8f8',
//     '#ff0000',
//     '#ff8000',
//     '#ffff00',
//     '#00ff00',
//     '#00ffff',
//     '#0000ff',
//     '#ff00ff',
//     '#e0e0e0',
//     '#ff4c4c',
//     '#ffa666',
//     '#ffffb2',
//     '#80ff00',
//     '#bcfff0',
//     '#0080ff',
//     '#e26090',
//     '#d8d8d8',
//     '#ff7f7f',
//     '#ffceac',
//     '#ffde73',
//     '#80f860',
//     '#66e6ff',
//     '#94c0ff',
//     '#ff8cc6',
//     '#cccccc',
//     '#ffc0c0',
//     '#ff6800',
//     '#f0c86c',
//     '#d4ff7f',
//     '#acdce6',
//     '#8080ff',
//     '#ffb8e0',
//     '#bfbfbf',
//     '#d8c0c0',
//     '#d8686c',
//     '#cccc66',
//     '#acd848',
//     '#b0e8e8',
//     '#b38cff',
//     '#e0a8bc',
//     '#a6a6a6',
//     '#c6a2a2',
//     '#d8beac',
//     '#c8c0a0',
//     '#3ae8b4',
//     '#3ce8e8',
//     '#e0c0f8',
//     '#e088f4',
// ];

// function findNearestColor(color: Color) {
//     return BOARD_COLORS.reduce((prev, cur) => {
//         const prevDist = color.distance(new Color(prev));
//         const curDist = color.distance(new Color(cur));
//         return curDist < prevDist ? cur : prev;
//     });
// }

export function strategyBoardToScene(strategyBoardData: Uint8Array): Scene {
    const strategyBoard = parseStrategyBoardData(strategyBoardData);

    // TODO BOARD remove console.log
    console.log('strategyBoard:');
    console.log(strategyBoard);

    const scene = {
        nextId: 1,
        arena: {
            floor: {
                shape: FloorShape.None,
                width: SCENE_WIDTH,
                height: SCENE_HEIGHT,
            },
            texture: {
                url: new URL(`public/board/background/${strategyBoard.background}.webp`, BASE_URL).href,
                width: SCENE_WIDTH,
                height: SCENE_HEIGHT,
            },
        },
    } as { -readonly [K in keyof Scene]: Scene[K] };

    const objects: SceneObject[] = [];
    for (const obj of strategyBoard.objects) {
        const sceneObj = parseObject(obj);
        if (sceneObj) {
            objects.push({
                id: scene.nextId++,
                layer: LayerName.Default, // 游戏内置战术板没有分层，所以导入时必须都在同一层，否则层叠关系可能会与游戏内不一致
                ...sceneObj,
            });
        }
    }

    scene.steps = [{ objects }];

    // TODO BOARD remove console.log
    console.log('scene:');
    console.log(scene);

    return scene;
}

const isJobIconId = (id: number) => (18 <= id && id <= 57) || (101 <= id && id <= 102) || (118 <= id && id <= 123);

const isWaymarkIconId = (id: number) => 79 <= id && id <= 86;

const isIndicatorIconId = (id: number) =>
    (65 <= id && id <= 78) || (115 <= id && id <= 117) || (131 <= id && id <= 138);

function parseObject(obj: SBObject): SceneObjectWithoutId | null {
    if (!knownObjects.includes(obj.id)) {
        console.error(`Parse game strategy board data error: Unknown object ID ${obj.id}.`);
        return null;
    }

    const iconId = obj.id as keyof typeof objectScaleFactor;
    const scale = obj.scale * (objectScaleFactor[iconId] ?? 1);
    const size = getObjectSize(iconId) * scale * SIZE_FACTOR;
    const coordinates = {
        x: obj.coordinates.x * POS_FACTOR - SCENE_WIDTH / 2,
        y: SCENE_HEIGHT / 2 - obj.coordinates.y * POS_FACTOR,
    };

    // ---------- 特殊处理 ----------

    // 职业/职能图标
    if (isJobIconId(iconId)) {
        return {
            type: ObjectType.Party,
            iconId: iconId,
            opacity: obj.color.opacity,
            hide: !obj.flags.visible,
            size,
            ...coordinates,
            pinned: obj.flags.locked,
            rotation: obj.angle,
        } as Omit<PartyObject, 'id'>;
    }

    // 场景标记
    if (isWaymarkIconId(iconId)) {
        return {
            type: ObjectType.Waymark,
            waymarkType: getWaymarkTypeById(iconId as WaymarkId),
            bgOpacity: 0,
            iconId: iconId,
            opacity: obj.color.opacity,
            hide: !obj.flags.visible,
            size,
            ...coordinates,
            pinned: obj.flags.locked,
            rotation: obj.angle,
        } as Omit<WaymarkObject, 'id'>;
    }

    // 点名标记、目标标记
    if (isIndicatorIconId(iconId)) {
        return {
            type: ObjectType.IndicatorMarker,
            iconId: iconId,
            opacity: obj.color.opacity,
            hide: !obj.flags.visible,
            size,
            ...coordinates,
            pinned: obj.flags.locked,
            rotation: obj.angle,
        } as Omit<IndicatorMarkerObject, 'id'>;
    }

    // 白色标记
    if ((87 <= obj.id && obj.id <= 90) || obj.id === 94 || obj.id === 103) {
        const common = {
            type: ObjectType.BoardIcon,
            iconId: iconId,
            opacity: obj.color.opacity,
            hide: !obj.flags.visible,
            size,
            ...coordinates,
            pinned: obj.flags.locked,
            rotation: obj.angle,
        };
        const flipV =
            obj.id === 89 || obj.id === 94 || obj.id === 103
                ? {
                      flipVertical: obj.flags.flipVertical,
                  }
                : {};
        const flipH =
            obj.id === 103
                ? {
                      flipHorizontal: obj.flags.flipHorizontal,
                  }
                : {};
        return {
            ...common,
            ...flipV,
            ...flipH,
        } as Omit<BoardIconObject, 'id'>;
    }

    switch (obj.id) {
        // 内置场景
        case 4:
        case 8:
        case 124:
        case 125:
            return {
                type: ObjectType.BoardIcon,
                iconId: iconId,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                size,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<BoardIconObject, 'id'>;

        // circle AoE
        case 9:
            return {
                type: ObjectType.AoeCircle,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: (size * 29) / 30 / 2, // 素材图里实际圆形与整个图片尺寸的比例是 29:30（四周有空白）
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<AoeCircleObject, 'id'>;

        // 扇形、环形、扇环
        case 10:
        case 17:
            return (() => {
                const θ = obj.param1 === 0 ? 0 : obj.param1 % 360 === 0 ? 360 : obj.param1 % 360; // 扇形开合角度
                const R = size; // 扇形半径
                const α = obj.angle + θ / 2; // 扇形中轴旋转角（xivplan扇形是向两侧展开，游戏里是顺时针展开，所以要加上一半的开合角度）
                const β = 90 + obj.angle; // 扇形坐标轴（以扇形左半径为-x方向的坐标轴）相对于主坐标轴（画布）倾斜的角度

                const { x: x1, y: y1 } = coordinates; // 包围扇形的矩形的中心，在主坐标轴（画布）上坐标

                // 包围扇形的矩形的中心，在扇形坐标轴（以扇形左半径为-x方向的坐标轴）上的坐标
                const { x: x2, y: y2 } = (() => {
                    const rad = (θ * Math.PI) / 180;
                    if (θ < 90) {
                        return {
                            x: -R / 2,
                            y: (R / 2) * Math.sin(rad),
                        };
                    } else if (90 <= θ && θ < 180) {
                        return {
                            x: (R / 2) * (Math.cos(Math.PI - rad) - 1),
                            y: R / 2,
                        };
                    } else if (180 <= θ && θ < 270) {
                        return {
                            x: 0,
                            y: (R / 2) * (1 - Math.sin(rad - Math.PI)),
                        };
                    } else {
                        return {
                            x: 0,
                            y: 0,
                        };
                    }
                })();

                // 已知一个点在 K1 和 K2 中的坐标，分别为 x1 y1 和 x2 y2。已知 K2 的坐标轴相对于 K1 顺时针倾斜了 β 角度。求 K2 原点在 K1 的坐标
                const { x, y } = (() => {
                    const rad = (β * Math.PI) / 180;
                    const cosA = Math.cos(rad);
                    const sinA = Math.sin(rad);

                    const x = x1 - x2 * cosA - y2 * sinA;
                    const y = y1 + x2 * sinA - y2 * cosA;

                    return { x, y };
                })();

                const common = {
                    opacity: obj.color.opacity,
                    hide: !obj.flags.visible,
                    x,
                    y,
                    radius: (R * 29) / 30, // 游戏里用的是圆形AoE素材裁剪成扇形，素材图里实际圆形与整个图片尺寸的比例是 29:30（四周有空白）
                    pinned: obj.flags.locked,
                    rotation: α,
                };

                return obj.id === 10
                    ? ({
                          ...common,
                          type: ObjectType.AoeFan,
                          fanAngle: θ,
                      } as Omit<AoeFanObject, 'id'>)
                    : θ !== 360
                      ? ({
                            ...common,
                            type: ObjectType.AoeArc,
                            fanAngle: θ,
                            innerRadius: obj.param2 * scale * SIZE_FACTOR,
                        } as Omit<AoeArcObject, 'id'>)
                      : ({
                            ...common,
                            type: ObjectType.AoeDonut,
                            innerRadius: obj.param2 * scale * SIZE_FACTOR,
                        } as Omit<AoeDonutObject, 'id'>);
            })();

        // rect AoE
        case 11:
            return (() => {
                const color = new Color(`rgb(${obj.color.red}, ${obj.color.green}, ${obj.color.blue})`).toString({
                    format: 'hex',
                    collapse: false,
                });
                return {
                    type: ObjectType.AoeRect,
                    opacity: obj.color.opacity,
                    hide: !obj.flags.visible,
                    width: obj.param1 * 2 * SIZE_FACTOR,
                    height: obj.param2 * 2 * SIZE_FACTOR,
                    baseColor: color,
                    baseOpacity: 100, // 游戏里只有实心的，保持外观一致
                    innerGlowColor: color,
                    outlineColor: color,
                    ...coordinates,
                    pinned: obj.flags.locked,
                    rotation: obj.angle,
                } as Omit<AoeRectObject, 'id'>;
            })();

        // line
        case 12:
            return (() => {
                const { x: x1, y: y1 } = coordinates;
                const { x: x2, y: y2 } = (() => {
                    return {
                        x: obj.param1 * POS_FACTOR - SCENE_WIDTH / 2,
                        y: SCENE_HEIGHT / 2 - obj.param2 * POS_FACTOR,
                    };
                })();
                const { x, y } = (() => {
                    return {
                        x: (x1 + x2) / 2,
                        y: (y1 + y2) / 2,
                    };
                })();
                const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                return {
                    type: ObjectType.Arrow,
                    color: new Color(`rgb(${obj.color.red}, ${obj.color.green}, ${obj.color.blue})`).toString({
                        format: 'hex',
                        collapse: false,
                    }),
                    arrowBegin: false,
                    arrowEnd: false,
                    width: obj.param3 * 2 * SIZE_FACTOR * 5,
                    height: distance,
                    x,
                    y,
                    opacity: obj.color.opacity,
                    hide: !obj.flags.visible,
                    pinned: obj.flags.locked,
                    rotation: obj.angle + 90,
                } as Omit<ArrowObject, 'id'>;
            })();

        // gaze
        case 13:
            return {
                type: ObjectType.MechGaze,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: size / 2,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
                invert: false,
            } as Omit<MechGazeObject, 'id'>;

        // stack
        case 14:
        case 106:
            return (() => {
                const common = {
                    type: ObjectType.IndicatorStack,
                    opacity: obj.color.opacity,
                    hide: !obj.flags.visible,
                    radius: size / 2,
                    ...coordinates,
                    pinned: obj.flags.locked,
                    rotation: obj.angle,
                };
                return (
                    obj.id === 106
                        ? {
                              ...common,
                              multiHit: true, // 106 是连续型
                          }
                        : common
                ) as Omit<IndicatorStackObject, 'id'>;
            })();

        // line stack
        case 15:
            return {
                type: ObjectType.IndicatorLineStack,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                size,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: (obj.angle + (obj.flags.flipVertical ? 180 : 0)) % 360,
                vNum: obj.param2,
            } as Omit<IndicatorLineStackObject, 'id'>;

        // proximity
        case 16:
            return {
                type: ObjectType.MechProximity,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: size / 2,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<MechProximityObject, 'id'>;

        // enemy
        case 60:
        case 62:
        case 64:
            return {
                type: ObjectType.Enemy,
                iconId: iconId,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                size,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<EnemyObject, 'id'>;

        // text
        case 100:
            return {
                type: ObjectType.Text,
                text: obj.string ?? '',
                style: 'outline',
                stroke: '#000000',
                fontSize: 30 * SIZE_FACTOR,
                align: 'center',
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
                color: new Color(`rgb(${obj.color.red}, ${obj.color.green}, ${obj.color.blue})`).toString({
                    format: 'hex',
                    collapse: false,
                }),
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
            } as Omit<TextObject, 'id'>;

        // proximity indicator
        case 107:
            return {
                type: ObjectType.IndicatorProximity,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: size / 2,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<IndicatorProximityObject, 'id'>;

        // tankbuster indicator
        case 108:
            return {
                type: ObjectType.IndicatorTankbuster,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: size / 2,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<IndicatorTankbusterObject, 'id'>;

        // radial knockback
        case 109:
            return {
                type: ObjectType.MechRadialKnockback,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: size / 2,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<MechRadialKnockbackObject, 'id'>;

        // linear knockback
        case 110:
            return {
                type: ObjectType.MechLinearKnockback,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                size,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: (obj.angle + (obj.flags.flipVertical ? 180 : 0)) % 360,
                hNum: obj.param1,
                vNum: obj.param2,
            } as Omit<MechLinearKnockbackObject, 'id'>;

        // tower
        case 111:
            return {
                type: ObjectType.MechTower,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: size / 2,
                count: 1,
                countValues: [1],
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<MechTowerObject, 'id'>;

        // targeting indicator
        case 112:
            return {
                type: ObjectType.IndicatorTargeting,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: size / 2,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<IndicatorTargetingObject, 'id'>;

        // Buff/Debuff
        case 113:
        case 114:
            return {
                type: ObjectType.BoardIcon,
                iconId: iconId,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                size,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<BoardIconObject, 'id'>;

        // circle exaflare
        case 126:
            return {
                type: ObjectType.MechCircleExaflare,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: size / 2,
                length: 1,
                spacing: 50,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: (obj.angle + (obj.flags.flipVertical ? 180 : 0)) % 360,
            } as Omit<MechCircleExaflareObject, 'id'>;

        // counter tower
        case 127:
        case 128:
        case 129:
        case 130:
            return {
                type: ObjectType.MechCounterTower,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: size / 2,
                count: obj.id - 126,
                countValues: [1, 2, 3, 4],
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<MechCounterTowerObject, 'id'>;

        // rotation
        case 139:
        case 140:
            return {
                type: ObjectType.MechRotation,
                anticlockwise: obj.id === 140,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                radius: size / 2,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<MechRotationObject, 'id'>;
    }

    // ---------- 通用处理 ----------

    return {
        type: ObjectType.BoardIcon,
        iconId: iconId,
        opacity: obj.color.opacity,
        hide: !obj.flags.visible,
        size,
        ...coordinates,
        pinned: obj.flags.locked,
        rotation: obj.angle,
        flipHorizontal: obj.flags.flipHorizontal,
        flipVertical: obj.flags.flipVertical,
        hNum: obj.param1,
        vNum: obj.param2,
    } as Omit<BoardIconObject, 'id'>;
}

export function sceneToStrategyBoard(scene: Scene, stepIndex: number, boardName?: string): string {
    const step = scene.steps[stepIndex];
    if (!step) {
        throw new Error(`Step ${stepIndex} does not exist`);
    }

    const objects: SBObject[] = [];

    for (const sceneObj of step.objects) {
        const sbObj = encodeObject(sceneObj);
        if (sbObj) {
            if (Array.isArray(sbObj)) {
                objects.push(...sbObj);
            } else {
                objects.push(sbObj);
            }
        }
    }

    const background = extractBackgroundId(scene);

    const strategyBoard = {
        boardName: boardName || '未命名战术板',
        objects,
        background,
    };

    const strategyBoardData = buildStrategyBoardData(strategyBoard);
    const shareString = encodeShareString(strategyBoardData);

    return shareString;
}

function encodeObject(sceneObj: SceneObject): SBObject | SBObject[] | null {
    const flags = {
        visible: !sceneObj.hide,
        flipHorizontal: isHorizontalFlippable(sceneObj) ? !!sceneObj.flipHorizontal : false,
        flipVertical: isVerticalFlippable(sceneObj) ? !!sceneObj.flipVertical : false,
        locked: isMovable(sceneObj) ? !!sceneObj.pinned : false,
    };

    const toStrategyBoardCoordinates = (coordinates: { x: number; y: number }) => ({
        x: (coordinates.x + SCENE_WIDTH / 2) / POS_FACTOR,
        y: (SCENE_HEIGHT / 2 - coordinates.y) / POS_FACTOR,
    });

    const coordinates = toStrategyBoardCoordinates(
        isMovable(sceneObj)
            ? {
                  x: sceneObj.x,
                  y: sceneObj.y,
              }
            : { x: 0, y: 0 },
    );

    switch (sceneObj.type) {
        case ObjectType.Party:
            return (() => {
                const obj = sceneObj as PartyObject;
                const iconId = obj.iconId as keyof typeof objectScaleFactor;
                if (!isJobIconId(iconId)) {
                    return null;
                }

                return {
                    id: iconId,
                    string: undefined,
                    flags,
                    coordinates,
                    angle: obj.rotation,
                    scale: obj.size / SIZE_FACTOR / getObjectSize(iconId) / (objectScaleFactor[iconId] ?? 1),
                    color: {
                        red: 0,
                        green: 0,
                        blue: 0,
                        opacity: obj.opacity,
                    },
                    param1: 0,
                    param2: 0,
                    param3: 0,
                } as SBObject;
            })();

        case ObjectType.Waymark:
            return (() => {
                const obj = sceneObj as WaymarkObject;
                const iconId = getWaymarkIdByType(obj.waymarkType);
                if (!isWaymarkIconId(iconId)) {
                    return null;
                }

                return {
                    id: iconId,
                    string: undefined,
                    flags,
                    coordinates,
                    angle: obj.rotation + (obj.fgRotation ?? 0),
                    scale: obj.size / SIZE_FACTOR / getObjectSize(iconId) / (objectScaleFactor[iconId] ?? 1),
                    color: {
                        red: 0,
                        green: 0,
                        blue: 0,
                        opacity: (obj.opacity * (obj.fgOpacity ?? 100)) / 100,
                    },
                    param1: 0,
                    param2: 0,
                    param3: 0,
                } as SBObject;
            })();

        case ObjectType.WaymarkGroup:
            return (() => {
                const obj = sceneObj as WaymarkGroupObject;
                const offsets = getWaymarkOffsetsFromGroup(obj);

                const convertCoordinate = (
                    origin: { x: number; y: number },
                    position: { x: number; y: number },
                    rotation: number,
                ): { x: number; y: number } => {
                    const rad = (rotation * Math.PI) / 180;
                    const cosA = Math.cos(rad);
                    const sinA = Math.sin(rad);

                    const x = origin.x + position.x * cosA + position.y * sinA;
                    const y = origin.y - position.x * sinA + position.y * cosA;

                    return { x, y };
                };

                const waymarks = offsets.map((offset) => {
                    const iconId = getWaymarkIdByType(offset.type);
                    const position = convertCoordinate(
                        { x: obj.x, y: obj.y },
                        { x: offset.x, y: -offset.y },
                        obj.rotation,
                    );

                    return {
                        id: iconId,
                        string: undefined,
                        flags,
                        coordinates: toStrategyBoardCoordinates(position),
                        angle: obj.rotation + (obj.fgRotation ?? 0),
                        scale: obj.size / SIZE_FACTOR / getObjectSize(iconId) / (objectScaleFactor[iconId] ?? 1),
                        color: {
                            red: 0,
                            green: 0,
                            blue: 0,
                            opacity: (obj.opacity * (obj.fgOpacity ?? 100)) / 100,
                        },
                        param1: 0,
                        param2: 0,
                        param3: 0,
                    } as SBObject;
                });

                return waymarks;
            })();

        case ObjectType.Circle:
        case ObjectType.AoeCircle:
            return (() => {
                const obj = sceneObj as AoeCircleObject | CircleZone;
                const color = isAoeObject(obj)
                    ? new Color(obj.baseColor ?? DEFAULT_AOE_COLOR)
                    : new Color(obj.color ?? DEFAULT_AOE_COLOR);

                return {
                    id: 9,
                    string: undefined,
                    flags,
                    coordinates,
                    angle: 0,
                    scale: (obj.radius * 2 * 30) / 29 / SIZE_FACTOR / getObjectSize(9) / objectScaleFactor[9],
                    color: {
                        red: Math.round(color.r * 255),
                        green: Math.round(color.g * 255),
                        blue: Math.round(color.b * 255),
                        opacity: obj.opacity,
                    },
                    param1: 0,
                    param2: 0,
                    param3: 0,
                } as SBObject;
            })();

        case ObjectType.Rect:
        case ObjectType.AoeRect:
            return (() => {
                const obj = sceneObj as AoeRectObject | RectangleZone;
                const color = isAoeObject(obj)
                    ? new Color(obj.baseColor ?? DEFAULT_AOE_COLOR)
                    : new Color(obj.color ?? DEFAULT_AOE_COLOR);

                return {
                    id: 11,
                    string: undefined,
                    flags,
                    coordinates,
                    angle: obj.rotation,
                    scale: 100,
                    color: {
                        red: Math.round(color.r * 255),
                        green: Math.round(color.g * 255),
                        blue: Math.round(color.b * 255),
                        opacity: obj.opacity,
                    },
                    param1: obj.width / SIZE_FACTOR / 2,
                    param2: obj.height / SIZE_FACTOR / 2,
                    param3: 0,
                } as SBObject;
            })();

        default:
            return null;
    }
}

function extractBackgroundId(scene: Scene): number {
    const textureUrl = scene.arena.texture?.url;
    if (!textureUrl) {
        return 1;
    }

    const match = textureUrl.match(new RegExp(BASE_URL + '/public/board/background/(\\d+)\\.webp$'));
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }

    return 1;
}
