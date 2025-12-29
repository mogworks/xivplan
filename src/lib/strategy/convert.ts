// copy & modify from https://github.com/Ennea/ffxiv-strategy-board-viewer/blob/master/draw.ts

import { getWaymarkTypeById } from '../../prefabs/waymarkIcon';
import {
    BoardIconObject,
    FloorShape,
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
    const size = getObjectSize(iconId);
    const scale = obj.scale * (objectScaleFactor[iconId] ?? 1);
    const coordinates = {
        x: obj.coordinates.x * POS_FACTOR - SCENE_WIDTH / 2,
        y: SCENE_HEIGHT / 2 - obj.coordinates.y * POS_FACTOR,
    };

    // ---------- 特殊处理 ----------

    // 职业/职能图标
    if ((18 <= obj.id && obj.id <= 57) || (101 <= obj.id && obj.id <= 102) || (118 <= obj.id && obj.id <= 123)) {
        return {
            type: ObjectType.Party,
            name: '',
            iconId: iconId,
            opacity: obj.color.opacity,
            hide: !obj.flags.visible,
            width: size * scale * SIZE_FACTOR,
            height: size * scale * SIZE_FACTOR,
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
            width: size * scale * SIZE_FACTOR,
            height: size * scale * SIZE_FACTOR,
            ...coordinates,
            pinned: obj.flags.locked,
            rotation: obj.angle,
        } as Omit<WaymarkObject, 'id'>;
    }

    switch (obj.id) {
        // line AoE
        case 11:
            return null;

        // line
        case 12:
            return null;

        // line stack
        case 15:
            return null;

        // fan AoE
        case 10:
            return null;

        // donut
        case 17:
            return null;

        // text
        case 100:
            return null;

        // linear knockback
        case 110:
            return null;
    }

    // ---------- 通用处理 ----------

    switch (iconId) {
        default:
            return {
                type: ObjectType.BoardIcon,
                iconId: iconId,
                opacity: obj.color.opacity,
                hide: !obj.flags.visible,
                width: size * scale * SIZE_FACTOR,
                height: size * scale * SIZE_FACTOR,
                ...coordinates,
                pinned: obj.flags.locked,
                rotation: obj.angle,
                flipHorizontal: obj.flags.flipHorizontal,
                flipVertical: obj.flags.flipVertical,
            } as Omit<BoardIconObject, 'id'>;
    }
}
