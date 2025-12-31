// copy & modify from https://github.com/Ennea/ffxiv-strategy-board-viewer/blob/master/draw.ts

import Color from 'colorjs.io';
import { getWaymarkTypeById } from '../../prefabs/waymarkIcon';
import { LayerName } from '../../render/layers';
import {
    AoeArcObject,
    AoeCircleObject,
    AoeDonutObject,
    AoeFanObject,
    AoeRectObject,
    BoardIconObject,
    FloorShape,
    MechGazeObject,
    MechStackObject,
    ObjectType,
    PartyObject,
    Scene,
    SceneObject,
    SceneObjectWithoutId,
    WaymarkObject,
} from '../../scene';
import { getObjectSize, knownObjects, objectScaleFactor } from './objects';
import { parseStrategyBoardData, SBObject } from './parser';

const BASE_URL = 'https://cos.xivstrat.cn';
const CANVAS_DESIGN_WIDTH = 5120; // game strategy board canvas design width
const CANVAS_GAME_WIDTH = 1024; // game strategy board canvas actual width
const SCENE_WIDTH = 640;
const SCENE_HEIGHT = 480;
const SIZE_FACTOR = SCENE_WIDTH / CANVAS_GAME_WIDTH;
const POS_FACTOR = SCENE_WIDTH / CANVAS_DESIGN_WIDTH;

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
    if ((18 <= obj.id && obj.id <= 57) || (101 <= obj.id && obj.id <= 102) || (118 <= obj.id && obj.id <= 123)) {
        return {
            type: ObjectType.Party,
            iconId: iconId,
            opacity: obj.color.opacity,
            hide: !obj.flags.visible,
            width: size,
            height: size,
            ...coordinates,
            pinned: obj.flags.locked,
            rotation: obj.angle,
        } as Omit<PartyObject, 'id'>;
    }

    // 场景标记
    if (79 <= obj.id && obj.id <= 86) {
        return {
            type: ObjectType.Waymark,
            waymarkType: getWaymarkTypeById(obj.id),
            bgOpacity: 0,
            iconId: iconId,
            opacity: obj.color.opacity,
            hide: !obj.flags.visible,
            width: size,
            height: size,
            ...coordinates,
            pinned: obj.flags.locked,
            rotation: obj.angle,
        } as Omit<WaymarkObject, 'id'>;
    }

    // 扇形、环形、扇环
    if (obj.id === 10 || obj.id === 17) {
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
    }

    switch (obj.id) {
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
            return null;

        // gaze
        case 13:
            return {
                type: ObjectType.MechGaze,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                width: size,
                height: size,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
                invert: false,
            } as Omit<MechGazeObject, 'id'>;

        // stack
        case 14:
            return {
                type: ObjectType.MechStack,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                width: size,
                height: size,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
            } as Omit<MechStackObject, 'id'>;

        // line stack
        case 15:
            return null;

        // text
        case 100:
            return null;

        // linear knockback
        case 110:
            return null;
    }

    // ---------- 通用处理 ----------

    return {
        type: ObjectType.BoardIcon,
        iconId: iconId,
        opacity: obj.color.opacity,
        hide: !obj.flags.visible,
        width: size,
        height: size,
        ...coordinates,
        pinned: obj.flags.locked,
        rotation: obj.angle,
        flipHorizontal: obj.flags.flipHorizontal,
        flipVertical: obj.flags.flipVertical,
    } as Omit<BoardIconObject, 'id'>;
}
