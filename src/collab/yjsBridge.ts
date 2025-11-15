import * as Y from 'yjs';
import { copyObjects } from '../copy';
import { Arena, Scene, SceneObject, SceneObjectWithoutId, SceneStep } from '../scene';

export interface YDocSchema {
    doc: Y.Doc;
    sceneMeta: Y.Map<unknown>;
    steps: Y.Array<Y.Array<Y.Map<unknown>>>;
}

export function createSchema(doc?: Y.Doc): YDocSchema {
    const d = doc ?? new Y.Doc();
    const sceneMeta = d.getMap('sceneMeta');
    const steps = d.getArray<Y.Array<Y.Map<unknown>>>('steps');
    return { doc: d, sceneMeta, steps };
}

export function initDocFromScene(schema: YDocSchema, scene: Scene) {
    schema.doc.transact(() => {
        schema.sceneMeta.set('nextId', scene.nextId);
        schema.sceneMeta.set('arena', scene.arena);
        schema.steps.delete(0, schema.steps.length);
        for (const step of scene.steps) {
            const yObjects = new Y.Array<Y.Map<unknown>>();
            for (const obj of step.objects) {
                const m = new Y.Map<unknown>();
                for (const [k, v] of Object.entries(obj) as [string, unknown][]) m.set(k, v);
                yObjects.push([m]);
            }
            schema.steps.push([yObjects]);
        }
    });
}

export function docToScene(schema: YDocSchema): Scene {
    const nextId = (schema.sceneMeta.get('nextId') as number | undefined) ?? 1;
    const arena = schema.sceneMeta.get('arena') as Arena;
    const steps: SceneStep[] = [];
    for (const yStep of schema.steps) {
        const objects: SceneObject[] = [];
        for (const m of yStep) {
            const obj = Object.fromEntries(Array.from(m.entries())) as unknown as SceneObject;
            objects.push(obj);
        }
        steps.push({ objects });
    }
    return { nextId, arena, steps };
}

function findObjectIndex(yObjects: Y.Array<Y.Map<unknown>>, id: number): number {
    for (let i = 0; i < yObjects.length; i++) {
        const m = yObjects.get(i);
        if ((m.get('id') as number) === id) return i;
    }
    return -1;
}

export function applyAdd(
    schema: YDocSchema,
    stepIndex: number,
    object: SceneObjectWithoutId | readonly SceneObjectWithoutId[],
    origin?: unknown,
) {
    const yStep = schema.steps.get(stepIndex);
    if (!yStep) return;
    const yObjects = yStep;
    const arr = Array.isArray(object) ? object : [object];
    schema.doc.transact(() => {
        for (const obj of arr) {
            const m = new Y.Map<unknown>();
            for (const [k, v] of Object.entries(obj) as [string, unknown][]) m.set(k, v);
            const nextId = (schema.sceneMeta.get('nextId') as number) ?? 1;
            m.set('id', nextId);
            schema.sceneMeta.set('nextId', nextId + 1);
            yObjects.push([m]);
        }
    }, origin);
}

export function applyRemove(schema: YDocSchema, stepIndex: number, ids: number | readonly number[], origin?: unknown) {
    const yObjects = schema.steps.get(stepIndex);
    if (!yObjects) return;
    const arr = Array.isArray(ids) ? ids : [ids];
    schema.doc.transact(() => {
        // 删除时从后往前以避免索引变化
        const indices = arr
            .map((id) => findObjectIndex(yObjects, id))
            .filter((i) => i >= 0)
            .sort((a, b) => b - a);
        for (const i of indices) yObjects.delete(i, 1);
        // 简化起见：关联的 Tether 由远端客户端各自处理；完整版本可在此级联
    }, origin);
}

export function applyUpdate(
    schema: YDocSchema,
    stepIndex: number,
    value: SceneObject | readonly SceneObject[],
    origin?: unknown,
) {
    const yObjects = schema.steps.get(stepIndex);
    if (!yObjects) return;
    const arr = Array.isArray(value) ? value : [value];
    schema.doc.transact(() => {
        for (const obj of arr) {
            const idx = findObjectIndex(yObjects, obj.id);
            if (idx < 0) continue;
            const m = yObjects.get(idx);
            const entries = Object.entries(obj) as [string, unknown][];
            const keys = new Set(entries.map(([k]) => k));
            for (const [k, v] of entries) m.set(k, v);
            for (const [existingKey] of Array.from(m.entries()) as [string, unknown][]) {
                if (!keys.has(existingKey)) m.delete(existingKey);
            }
        }
    }, origin);
}

export function applyMove(schema: YDocSchema, stepIndex: number, from: number, to: number, origin?: unknown) {
    const yObjects = schema.steps.get(stepIndex);
    if (!yObjects) return;
    if (from === to) return;
    if (from < 0 || from > yObjects.length - 1) return;
    if (to < 0) to = 0;
    if (to > yObjects.length) to = yObjects.length;
    schema.doc.transact(() => {
        const orig = yObjects.get(from);
        if (!orig) return;
        const m = new Y.Map<unknown>();
        for (const [k, v] of Array.from(orig.entries()) as [string, unknown][]) m.set(k, v);
        yObjects.delete(from, 1);
        yObjects.insert(to, [m]);
    }, origin);
}

export function applyArena(schema: YDocSchema, arena: Arena, origin?: unknown) {
    schema.doc.transact(() => {
        schema.sceneMeta.set('arena', arena);
    }, origin);
}

export function applySetStep(schema: YDocSchema, index: number) {
    let i = index;
    if (i < 0) i = 0;
    const max = schema.steps.length - 1;
    if (i > max) i = max;
    schema.sceneMeta.set('currentStep', i);
}

export function applyAddStep(schema: YDocSchema, after?: number, origin?: unknown) {
    const scene = docToScene(schema);
    let idx = after ?? (schema.sceneMeta.get('currentStep') as number) ?? 0;
    if (idx < 0) idx = 0;
    if (idx > schema.steps.length - 1) idx = schema.steps.length - 1;
    const current = scene.steps[idx] ?? { objects: [] };
    const copied = copyObjects(scene, current.objects);
    let nextId = scene.nextId;
    const newYStep = new Y.Array<Y.Map<unknown>>();
    for (const obj of copied) {
        const m = new Y.Map<unknown>();
        for (const [k, v] of Object.entries(obj) as [string, unknown][]) m.set(k, v);
        m.set('id', nextId++);
        newYStep.push([m]);
    }
    schema.doc.transact(() => {
        schema.steps.insert(idx + 1, [newYStep]);
        schema.sceneMeta.set('nextId', nextId);
        schema.sceneMeta.set('currentStep', idx + 1);
    }, origin);
}

export function applyRemoveStep(schema: YDocSchema, index: number, origin?: unknown) {
    const length = schema.steps.length;
    if (length <= 0) return;
    schema.doc.transact(() => {
        let idx = index;
        if (idx < 0) idx = 0;
        if (idx > schema.steps.length - 1) idx = schema.steps.length - 1;
        schema.steps.delete(idx, 1);
        if (schema.steps.length === 0) {
            schema.steps.push([new Y.Array<Y.Map<unknown>>()]);
        }
        let current = (schema.sceneMeta.get('currentStep') as number) ?? 0;
        if (idx === current) current--;
        if (current < 0) current = 0;
        if (current > schema.steps.length - 1) current = schema.steps.length - 1;
        schema.sceneMeta.set('currentStep', current);
    }, origin);
}

export function applyReorderSteps(schema: YDocSchema, order: number[], origin?: unknown) {
    const length = schema.steps.length;
    if (!Array.isArray(order) || order.length !== length) return;
    const cloned: Y.Array<Y.Map<unknown>>[] = [];
    for (const i of order) {
        const srcStep = schema.steps.get(i);
        if (!srcStep) return;
        const newStep = new Y.Array<Y.Map<unknown>>();
        for (const srcMap of srcStep) {
            const m = new Y.Map<unknown>();
            for (const [k, v] of Array.from(srcMap.entries()) as [string, unknown][]) m.set(k, v);
            newStep.push([m]);
        }
        cloned.push(newStep);
    }
    schema.doc.transact(() => {
        schema.steps.delete(0, length);
        schema.steps.insert(0, cloned);
        const oldCurrent = (schema.sceneMeta.get('currentStep') as number) ?? 0;
        let newCurrent = order.indexOf(oldCurrent);
        if (newCurrent < 0) newCurrent = 0;
        if (newCurrent > schema.steps.length - 1) newCurrent = schema.steps.length - 1;
        schema.sceneMeta.set('currentStep', newCurrent);
    }, origin);
}
