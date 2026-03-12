import { Vector2d } from 'konva/lib/types';
import {
    isMovable,
    isTether,
    MovableObject,
    Scene,
    SceneObject,
    SceneObjectWithoutId,
    Tether,
    UnknownObject,
} from './scene';
import { isNotNull } from './util';
import { VEC_ZERO, vecAdd, vecSub } from './vector';

export function getGroupCenter(objects: readonly MovableObject[]): Vector2d {
    const movable = objects.filter(isMovable);
    if (!movable.length) {
        return { x: 0, y: 0 };
    }

    const x = movable.reduce((result, obj) => result + obj.x, 0) / movable.length;
    const y = movable.reduce((result, obj) => result + obj.y, 0) / movable.length;

    return { x, y };
}

function isTargetCopied(originalTargets: readonly UnknownObject[], id: number) {
    return originalTargets.some((obj) => obj.id === id);
}

function retargetTether(scene: Scene, originalTargets: readonly UnknownObject[], id: number) {
    const targetIndex = originalTargets.findIndex((obj) => obj.id === id);
    if (targetIndex >= 0) {
        return scene.nextId + targetIndex;
    }
    return id;
}

function getOffset(objects: readonly SceneObject[], newCenter?: Vector2d) {
    if (newCenter) {
        const currentCenter = getGroupCenter(objects.filter(isMovable));
        return vecSub(newCenter, currentCenter);
    }

    return VEC_ZERO;
}

function isCopyable(object: Readonly<SceneObject>, objects: readonly SceneObject[]) {
    if (isMovable(object)) {
        return true;
    }

    if (isTether(object)) {
        return isTargetCopied(objects, object.startId) || isTargetCopied(objects, object.endId);
    }

    return false;
}

function copyObject(object: Readonly<MovableObject & UnknownObject>, offset: Vector2d): SceneObjectWithoutId {
    const pos = vecAdd(object, offset);
    return { ...object, ...pos, id: undefined };
}

function copyObjectWithId(
    object: Readonly<MovableObject & UnknownObject>,
    offset: Vector2d,
    id: number,
): SceneObjectWithoutId {
    const pos = vecAdd(object, offset);
    return { ...object, ...pos, id };
}

function copyTether(
    scene: Readonly<Scene>,
    tether: Readonly<Tether>,
    originalTargets: readonly UnknownObject[],
): SceneObjectWithoutId | null {
    if (!isTargetCopied(originalTargets, tether.startId) && !isTargetCopied(originalTargets, tether.endId)) {
        return null;
    }

    const newTether = {
        ...tether,
        startId: retargetTether(scene, originalTargets, tether.startId),
        endId: retargetTether(scene, originalTargets, tether.endId),
    };

    return { ...newTether, id: undefined };
}

function copyTetherWithId(
    tether: Readonly<Tether>,
    originalTargets: readonly UnknownObject[],
    idMap: ReadonlyMap<number, number>,
    id: number,
): SceneObjectWithoutId | null {
    if (!isTargetCopied(originalTargets, tether.startId) && !isTargetCopied(originalTargets, tether.endId)) {
        return null;
    }

    const startId = idMap.get(tether.startId) ?? tether.startId;
    const endId = idMap.get(tether.endId) ?? tether.endId;

    return {
        ...(tether as unknown as Omit<Tether, 'id'>),
        startId,
        endId,
        id,
    } as SceneObjectWithoutId;
}

export function copyObjects(
    scene: Readonly<Scene>,
    objects: readonly SceneObject[],
    newCenter?: Vector2d,
    getNewId?: (() => number) | undefined,
): SceneObjectWithoutId[] {
    const copyable = objects.slice().filter((o) => isCopyable(o, objects));

    const offset = getOffset(copyable, newCenter);

    if (getNewId) {
        // Deterministic copy with caller-provided ID assignment.
        const idMap = new Map<number, number>();
        for (const obj of copyable) {
            if (isMovable(obj) && !idMap.has(obj.id)) {
                idMap.set(obj.id, getNewId());
            }
        }

        return objects
            .map((obj) => {
                if (isMovable(obj)) {
                    const id = idMap.get(obj.id);
                    if (id === undefined) {
                        return null;
                    }
                    return copyObjectWithId(obj, offset, id);
                }

                if (isTether(obj)) {
                    return copyTetherWithId(obj, copyable, idMap, getNewId());
                }

                return null;
            })
            .filter(isNotNull);
    }

    return objects
        .map((obj) => {
            if (isMovable(obj)) {
                return copyObject(obj, offset);
            }

            if (isTether(obj)) {
                return copyTether(scene, obj, copyable);
            }

            return null;
        })
        .filter(isNotNull);
}
