// copy & modify from https://github.com/Ennea/ffxiv-strategy-board-viewer/blob/master/draw.ts

import Color from 'colorjs.io';
import {
    getWaymarkIdByType,
    getWaymarkOffsetsFromGroup,
    getWaymarkTypeById,
    WaymarkId,
} from '../../prefabs/waymarkIcon';
import { LayerName } from '../../render/layers';
import { getLayerName } from '../../render/ObjectRegistry';
import {
    AoeArcObject,
    AoeCircleObject,
    AoeDonutObject,
    AoeFanObject,
    AoeLineObject,
    AoeRectObject,
    ArcZone,
    ArrowObject,
    BaseObject,
    BoardIconObject,
    CircleZone,
    DonutZone,
    EnemyObject,
    FanZone,
    FloorShape,
    IndicatorLineStackObject,
    IndicatorMarkerObject,
    IndicatorProximityObject,
    IndicatorStackObject,
    IndicatorTankbusterObject,
    IndicatorTargetingObject,
    isAoeObject,
    isFanLike,
    isHorizontalFlippable,
    isInnerRadiusObject,
    isMovable,
    isRotatable,
    isVerticalFlippable,
    LineZone,
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
    RadiusObject,
    RectangleZone,
    RegularResizableObject,
    RotatableObject,
    Scene,
    SceneObject,
    SceneObjectWithoutId,
    Tether,
    TextObject,
    WaymarkGroupObject,
    WaymarkObject,
} from '../../scene';
import { getObjectById } from '../../SceneProvider';
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
                url: new URL(`board/background/${strategyBoard.background}.webp`, BASE_URL).href,
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

const isEnemyIconId = (id: number) => id === 60 || id === 62 || id === 64;

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
                fontSize: (30 * SIZE_FACTOR * scale) / 100,
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

    // 对step.objects排序
    const mutableObjects = [...step.objects];
    // 定义层级优先级：Controls > Active > Foreground > Default > Ground
    const layerPriority: Record<LayerName, number> = {
        [LayerName.Ground]: 1,
        [LayerName.Default]: 2,
        [LayerName.Foreground]: 3,
        [LayerName.Active]: 4,
        [LayerName.Controls]: 5,
    };

    // 实现稳定排序：层级相同时保持原始顺序
    mutableObjects
        .map((obj, index) => ({ obj, index })) // 添加原始索引
        .sort(({ obj: a, index: indexA }, { obj: b, index: indexB }) => {
            const layerA = getLayerName(a) ?? LayerName.Default;
            const layerB = getLayerName(b) ?? LayerName.Default;

            // 先按层级优先级排序
            const priorityDiff = layerPriority[layerA] - layerPriority[layerB];
            if (priorityDiff !== 0) {
                return priorityDiff;
            }

            // 层级相同时，按原始索引排序以保持稳定
            return indexA - indexB;
        })
        .forEach(({ obj }, index) => {
            mutableObjects[index] = obj;
        });

    const objects: SBObject[] = [];

    for (const sceneObj of mutableObjects) {
        const sbObj = encodeObject(scene, sceneObj);
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

function encodeObject(scene: Scene, sceneObj: SceneObject): SBObject | SBObject[] | null {
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

    const buildRadiusSBObject = (
        obj: BaseObject & RadiusObject & RotatableObject,
        iconId: keyof typeof objectScaleFactor,
    ) =>
        ({
            id: iconId,
            string: undefined,
            flags,
            coordinates,
            angle: obj.rotation,
            scale: (obj.radius * 2) / SIZE_FACTOR / getObjectSize(iconId) / (objectScaleFactor[iconId] ?? 1),
            color: {
                red: 255,
                green: 255,
                blue: 255,
                opacity: obj.opacity,
            },
            param1: 0,
            param2: 0,
            param3: 0,
        }) as SBObject;

    const buildSizeSBObject = (
        obj: BaseObject & RegularResizableObject & RotatableObject,
        iconId: keyof typeof objectScaleFactor,
    ) =>
        ({
            id: iconId,
            string: undefined,
            flags,
            coordinates,
            angle: obj.rotation,
            scale: obj.size / SIZE_FACTOR / getObjectSize(iconId) / (objectScaleFactor[iconId] ?? 1),
            color: {
                red: 255,
                green: 255,
                blue: 255,
                opacity: obj.opacity,
            },
            param1: 0,
            param2: 0,
            param3: 0,
        }) as SBObject;

    switch (sceneObj.type) {
        case ObjectType.Party:
            return (() => {
                const obj = sceneObj as PartyObject;
                const iconId = obj.iconId as keyof typeof objectScaleFactor;
                if (!isJobIconId(iconId)) {
                    return null;
                }

                return buildSizeSBObject(obj, iconId);
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
                        red: 255,
                        green: 255,
                        blue: 255,
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
                            red: 255,
                            green: 255,
                            blue: 255,
                            opacity: (obj.opacity * (obj.fgOpacity ?? 100)) / 100,
                        },
                        param1: 0,
                        param2: 0,
                        param3: 0,
                    } as SBObject;
                });

                return waymarks;
            })();

        case ObjectType.IndicatorMarker:
            return (() => {
                const obj = sceneObj as IndicatorMarkerObject;
                const iconId = obj.iconId as keyof typeof objectScaleFactor;
                if (!isIndicatorIconId(iconId)) {
                    return null;
                }

                return buildSizeSBObject(obj, iconId);
            })();

        case ObjectType.MechGaze:
            return (() => {
                const obj = sceneObj as MechGazeObject;
                const iconId = 13;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.IndicatorStack:
            return (() => {
                const obj = sceneObj as IndicatorStackObject;
                const iconId = obj.multiHit ? 106 : 14;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.IndicatorLineStack:
            return (() => {
                const obj = sceneObj as IndicatorLineStackObject;
                const iconId = 15;

                return {
                    id: iconId,
                    string: undefined,
                    flags,
                    coordinates,
                    angle: obj.rotation,
                    scale: obj.size / SIZE_FACTOR / getObjectSize(iconId) / (objectScaleFactor[iconId] ?? 1),
                    color: {
                        red: 255,
                        green: 255,
                        blue: 255,
                        opacity: obj.opacity,
                    },
                    param1: 1,
                    param2: obj.vNum ?? 1,
                    param3: 0,
                } as SBObject;
            })();

        case ObjectType.MechProximity:
            return (() => {
                const obj = sceneObj as MechProximityObject;
                const iconId = 16;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.Enemy:
            return (() => {
                const obj = sceneObj as EnemyObject;
                const iconId = obj.iconId as keyof typeof objectScaleFactor;
                if (!isEnemyIconId(iconId)) {
                    return null;
                }

                return buildSizeSBObject(obj, iconId);
            })();

        case ObjectType.Text:
            return (() => {
                const obj = sceneObj as TextObject;
                const iconId = 100;
                const color = new Color(obj.color ?? '#ffffff');

                return {
                    id: iconId,
                    string: obj.text,
                    flags,
                    coordinates,
                    angle: obj.rotation,
                    scale: (100 * obj.fontSize) / SIZE_FACTOR / 30,
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

        case ObjectType.IndicatorProximity:
            return (() => {
                const obj = sceneObj as IndicatorProximityObject;
                const iconId = 107;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.IndicatorTankbuster:
            return (() => {
                const obj = sceneObj as IndicatorTankbusterObject;
                const iconId = 108;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.MechRadialKnockback:
            return (() => {
                const obj = sceneObj as MechRadialKnockbackObject;
                const iconId = 109;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.MechLinearKnockback:
            return (() => {
                const obj = sceneObj as MechLinearKnockbackObject;
                const iconId = 110;

                return {
                    id: iconId,
                    string: undefined,
                    flags,
                    coordinates,
                    angle: obj.rotation,
                    scale: obj.size / SIZE_FACTOR / getObjectSize(iconId) / (objectScaleFactor[iconId] ?? 1),
                    color: {
                        red: 255,
                        green: 255,
                        blue: 255,
                        opacity: obj.opacity,
                    },
                    param1: obj.hNum ?? 1,
                    param2: obj.vNum ?? 1,
                    param3: 0,
                } as SBObject;
            })();

        case ObjectType.MechTower:
            return (() => {
                const obj = sceneObj as MechTowerObject;
                const iconId = 111;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.IndicatorTargeting:
            return (() => {
                const obj = sceneObj as IndicatorTargetingObject;
                const iconId = 112;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.MechCircleExaflare:
            return (() => {
                const obj = sceneObj as MechCircleExaflareObject;
                const iconId = 126;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.MechCounterTower:
            return (() => {
                const obj = sceneObj as MechCounterTowerObject;
                const iconId = (126 + obj.count) as keyof typeof objectScaleFactor;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.MechRotation:
            return (() => {
                const obj = sceneObj as MechRotationObject;
                const iconId = obj.anticlockwise ? 140 : 139;

                return buildRadiusSBObject(obj, iconId);
            })();

        case ObjectType.BoardIcon:
            return (() => {
                const obj = sceneObj as BoardIconObject;
                const iconId = obj.iconId as keyof typeof objectScaleFactor;

                return buildSizeSBObject(obj, iconId);
            })();

        case ObjectType.Fan:
        case ObjectType.Arc:
        case ObjectType.Donut:
        case ObjectType.AoeFan:
        case ObjectType.AoeArc:
        case ObjectType.AoeDonut:
            return (() => {
                const obj = sceneObj as AoeFanObject | AoeArcObject | AoeDonutObject | FanZone | ArcZone | DonutZone;

                // 扇形开合角度
                const θ = isFanLike(obj) ? obj.fanAngle : 360;

                const iconId = obj.type === ObjectType.AoeFan ? 10 : 17;

                const rotation = isRotatable(obj) ? obj.rotation : 0;

                const angle = rotation - θ / 2;
                const β = 90 + angle;
                const R = (obj.radius * 30) / 29;

                // 计算包围扇形的矩形的中心在扇形坐标轴上的坐标
                const { x2, y2 } = (() => {
                    const rad = (θ * Math.PI) / 180;
                    if (θ < 90) {
                        return {
                            x2: -R / 2,
                            y2: (R / 2) * Math.sin(rad),
                        };
                    } else if (90 <= θ && θ < 180) {
                        return {
                            x2: (R / 2) * (Math.cos(Math.PI - rad) - 1),
                            y2: R / 2,
                        };
                    } else if (180 <= θ && θ < 270) {
                        return {
                            x2: 0,
                            y2: (R / 2) * (1 - Math.sin(rad - Math.PI)),
                        };
                    } else {
                        return { x2: 0, y2: 0 };
                    }
                })();

                // 坐标转换
                const rad = (β * Math.PI) / 180;
                const cosA = Math.cos(rad);
                const sinA = Math.sin(rad);

                const x1 = obj.x + x2 * cosA + y2 * sinA;
                const y1 = obj.y - x2 * sinA + y2 * cosA;

                const scale = R / SIZE_FACTOR / getObjectSize(iconId);
                const innerRadius = isInnerRadiusObject(obj) ? obj.innerRadius : 0;

                return {
                    id: iconId,
                    string: undefined,
                    flags,
                    coordinates: toStrategyBoardCoordinates({ x: x1, y: y1 }),
                    angle,
                    scale: scale / (objectScaleFactor[iconId] ?? 1),
                    color: {
                        red: 255,
                        green: 255,
                        blue: 255,
                        opacity: obj.opacity,
                    },
                    param1: θ,
                    param2: innerRadius / SIZE_FACTOR / scale,
                    param3: 0,
                } as SBObject;
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
                    ? new Color(obj.baseColor ?? '#ff8000')
                    : new Color(obj.color ?? '#ff8000');

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

        case ObjectType.Line:
        case ObjectType.AoeLine:
            return (() => {
                const obj = sceneObj as AoeLineObject | LineZone;
                const color = isAoeObject(obj)
                    ? new Color(obj.baseColor ?? '#ff8000')
                    : new Color(obj.color ?? '#ff8000');

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

                const position = convertCoordinate({ x: obj.x, y: obj.y }, { x: 0, y: obj.length / 2 }, obj.rotation);

                return {
                    id: 11,
                    string: undefined,
                    flags,
                    coordinates: toStrategyBoardCoordinates(position),
                    angle: obj.rotation,
                    scale: 100,
                    color: {
                        red: Math.round(color.r * 255),
                        green: Math.round(color.g * 255),
                        blue: Math.round(color.b * 255),
                        opacity: obj.opacity,
                    },
                    param1: obj.width / SIZE_FACTOR / 2,
                    param2: obj.length / SIZE_FACTOR / 2,
                    param3: 0,
                } as SBObject;
            })();

        case ObjectType.Arrow:
            return (() => {
                const obj = sceneObj as ArrowObject;
                const color = new Color(obj.color ?? '#ff8000');
                const param3 = obj.width / 2 / SIZE_FACTOR / 5;
                const x = obj.x;
                const y = obj.y;
                const d = obj.height;
                const rad = (obj.rotation * Math.PI) / 180;
                const sin = Math.sin(rad);
                const cos = Math.cos(rad);
                const x1 = x - (d / 2) * sin;
                const y1 = y - (d / 2) * cos;
                const x2 = x + (d / 2) * sin;
                const y2 = y + (d / 2) * cos;
                const begin = toStrategyBoardCoordinates({ x: x1, y: y1 });
                const end = toStrategyBoardCoordinates({ x: x2, y: y2 });

                return {
                    id: 12,
                    string: undefined,
                    flags,
                    coordinates: begin,
                    angle: obj.rotation - 90,
                    scale: 100,
                    color: {
                        red: Math.round(color.r * 255),
                        green: Math.round(color.g * 255),
                        blue: Math.round(color.b * 255),
                        opacity: obj.opacity,
                    },
                    param1: end.x,
                    param2: end.y,
                    param3: param3,
                } as SBObject;
            })();

        case ObjectType.Tether:
            return (() => {
                const obj = sceneObj as Tether;
                const startObj = getObjectById(scene, obj.startId);
                const endObj = getObjectById(scene, obj.endId);
                if (!isMovable(startObj) || !isMovable(endObj)) {
                    return null;
                }
                const startPos = { x: startObj.x, y: startObj.y };
                const endPos = { x: endObj.x, y: endObj.y };

                const color = new Color(obj.color ?? '#ff8000');
                const param3 = obj.width / SIZE_FACTOR / 2;
                const rad = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);

                const begin = toStrategyBoardCoordinates(startPos);
                const end = toStrategyBoardCoordinates(endPos);

                return {
                    id: 12,
                    string: undefined,
                    flags,
                    coordinates: begin,
                    angle: (rad * 180) / Math.PI - 90,
                    scale: 100,
                    color: {
                        red: Math.round(color.r * 255),
                        green: Math.round(color.g * 255),
                        blue: Math.round(color.b * 255),
                        opacity: obj.opacity,
                    },
                    param1: end.x,
                    param2: end.y,
                    param3: param3,
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

    const match = textureUrl.match(new RegExp(BASE_URL + '/board/background/(\\d+)\\.webp$'));
    if (match && match[1]) {
        const backgroundId = parseInt(match[1], 10);
        if (1 <= backgroundId && backgroundId <= 7) {
            return backgroundId;
        }
    }

    return 1;
}
