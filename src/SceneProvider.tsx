/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from 'react';
import { CollaborationProvider, useCollaboration } from './collab/CollaborationProvider';
import { copyObjects } from './copy';
import {
    Arena,
    DEFAULT_ARENA_PADDING,
    DEFAULT_FLOOR,
    DEFAULT_SCENE,
    Floor,
    FloorShape,
    Grid,
    isTether,
    NO_GRID,
    Padding,
    Scene,
    SceneObject,
    SceneObjectWithoutId,
    SceneStep,
    Tether,
    Ticks,
} from './scene';
import { createUndoContext } from './undo/undoContext';
import { StateActionBase, UndoRedoAction } from './undo/undoReducer';
import { useSetSavedState } from './useIsDirty';
import { asArray, clamp } from './util';

export interface SetArenaAction {
    type: 'arena';
    value: Arena;
}

export interface SetArenaBackgroundColorAction {
    type: 'arenaBackgroundColor';
    value: string;
}

export interface SetArenaBackgroundOpacityAction {
    type: 'arenaBackgroundOpacity';
    value: number;
}

export interface SetArenaBackgroundPaddingAction {
    type: 'arenaBackgroundPadding';
    value: Padding;
}

export interface SetArenaFloorShapeAction {
    type: 'arenaFloorShape';
    value: FloorShape;
}

export interface SetArenaFloorColorAction {
    type: 'arenaFloorColor';
    value: string;
}

export interface SetArenaFloorOpacityAction {
    type: 'arenaFloorOpacity';
    value: number;
}

export interface SetArenaFloorWidthAction {
    type: 'arenaFloorWidth';
    value: number;
}

export interface SetArenaFloorHeightAction {
    type: 'arenaFloorHeight';
    value: number;
}

export interface SetArenaTextureUrlAction {
    type: 'arenaTextureUrl';
    value: string;
}

export interface SetArenaTextureOpacityAction {
    type: 'arenaTextureOpacity';
    value: number;
}

export interface SetArenaTextureOffsetXAction {
    type: 'arenaTextureOffsetX';
    value: number;
}

export interface SetArenaTextureOffsetYAction {
    type: 'arenaTextureOffsetY';
    value: number;
}

export interface SetArenaTextureWidthAction {
    type: 'arenaTextureWidth';
    value: number;
}

export interface SetArenaTextureHeightAction {
    type: 'arenaTextureHeight';
    value: number;
}

export interface SetArenaGridAction {
    type: 'arenaGrid';
    value: Grid;
}

export interface SetArenaGridStrokeAction {
    type: 'arenaGridStroke';
    value: string;
}

export interface SetArenaGridOpacityAction {
    type: 'arenaGridOpacity';
    value: number;
}

export interface SetArenaTicksActions {
    type: 'arenaTicks';
    value: Ticks;
}

export type ArenaAction =
    | SetArenaAction
    | SetArenaBackgroundColorAction
    | SetArenaBackgroundOpacityAction
    | SetArenaBackgroundPaddingAction
    | SetArenaFloorShapeAction
    | SetArenaFloorColorAction
    | SetArenaFloorOpacityAction
    | SetArenaFloorWidthAction
    | SetArenaFloorHeightAction
    | SetArenaTextureUrlAction
    | SetArenaTextureOpacityAction
    | SetArenaTextureOffsetXAction
    | SetArenaTextureOffsetYAction
    | SetArenaTextureWidthAction
    | SetArenaTextureHeightAction
    | SetArenaGridAction
    | SetArenaGridStrokeAction
    | SetArenaGridOpacityAction
    | SetArenaTicksActions;

export interface ObjectUpdateAction {
    type: 'update';
    value: SceneObject | readonly SceneObject[];
    /** When set, the update applies to this step instead of the viewer's current step. */
    stepIndex?: number;
}

export interface ObjectAddAction {
    type: 'add';
    object: SceneObjectWithoutId | readonly SceneObjectWithoutId[];
    /** When set, the add applies to this step instead of the viewer's current step. */
    stepIndex?: number;
    /**
     * When provided, overrides the scene's nextId after the add.
     * Used for collaborative editing where IDs may be pre-assigned.
     */
    nextId?: number;
}

export interface ObjectRemoveAction {
    type: 'remove';
    ids: number | readonly number[];
    /** When set, the remove applies to this step instead of the viewer's current step. */
    stepIndex?: number;
}

export interface ObjectMoveAction {
    type: 'move';
    from: number;
    to: number;
    /** When set, the move applies to this step instead of the viewer's current step. */
    stepIndex?: number;
}

export interface GroupMoveAction {
    type: 'moveUp' | 'moveDown' | 'moveToTop' | 'moveToBottom';
    ids: number | readonly number[];
    /** When set, the move applies to this step instead of the viewer's current step. */
    stepIndex?: number;
}

export type ObjectAction =
    | ObjectAddAction
    | ObjectRemoveAction
    | ObjectMoveAction
    | GroupMoveAction
    | ObjectUpdateAction;

export interface SetStepAction {
    type: 'setStep';
    index: number;
}

export interface IncrementStepAction {
    type: 'nextStep' | 'previousStep';
}

export interface AddStepAction {
    type: 'addStep';
    after?: number;
    /**
     * Optional pre-built step contents. When omitted, the step is created by copying the current step.
     * This is used for collaborative editing to ensure deterministic ID assignment.
     */
    step?: SceneStep;
    /** When provided, overrides the scene's nextId after adding the step. */
    nextId?: number;
}

export interface RemoveStepAction {
    type: 'removeStep';
    index: number;
}

export interface ReorderStepsAction {
    type: 'reoderSteps';
    order: number[];
}

export type StepAction = SetStepAction | IncrementStepAction | AddStepAction | RemoveStepAction | ReorderStepsAction;

// TODO: the source should be separate from the undo history
export interface SetSourceAction {
    type: 'setSource';
    source: FileSource | undefined;
}

export type SceneAction = (ArenaAction | ObjectAction | StepAction | SetSourceAction) & StateActionBase;

export interface LocalStorageFileSource {
    type: 'local';
    name: string;
}

export interface FileSystemFileSource {
    type: 'fs';
    name: string;
    handle: FileSystemFileHandle;
}

export interface BlobFileSource {
    type: 'blob';
    name: string;
    file?: File;
}

export type FileSource = LocalStorageFileSource | FileSystemFileSource | BlobFileSource;

export interface EditorState {
    scene: Scene;
    currentStep: number;
}

function getCurrentStep(state: EditorState): SceneStep {
    const step = state.scene.steps[state.currentStep];
    if (!step) {
        throw new Error(`Invalid step index ${state.currentStep}`);
    }
    return step;
}

function getStepAt(scene: Readonly<Scene>, index: number): SceneStep {
    const step = scene.steps[index];
    if (!step) {
        throw new Error(`Invalid step index ${index}`);
    }
    return step;
}

const HISTORY_SIZE = 1000;

const SourceContext = createContext<[FileSource | undefined, Dispatch<SetStateAction<FileSource | undefined>>]>([
    undefined,
    () => {},
]);

const { UndoProvider, Context, usePresent, useUndoRedoPossible } = createUndoContext(sceneReducer, HISTORY_SIZE);

export interface SceneProviderProps extends PropsWithChildren {
    initialScene?: Scene;
}

export const SceneProvider: React.FC<SceneProviderProps> = ({ initialScene, children }) => {
    const source = useState<FileSource | undefined>();

    const initialState: EditorState = {
        scene: initialScene ?? DEFAULT_SCENE,
        currentStep: 0,
    };

    return (
        <SourceContext value={source}>
            <UndoProvider initialState={initialState}>
                <CollaborationBridge>{children}</CollaborationBridge>
            </UndoProvider>
        </SourceContext>
    );
};

const CollaborationBridge: React.FC<PropsWithChildren> = ({ children }) => {
    const [, present, rawDispatch] = usePresent();
    return (
        <CollaborationProvider present={present} rawDispatch={rawDispatch}>
            {children}
        </CollaborationProvider>
    );
};

export const SceneContext = Context;

/**
 * Internal helper hooks for features that need raw undo-context access
 * (e.g. collaborative editing).
 */
export function useRawScenePresent(): [transientPresent: EditorState, present: EditorState] {
    const [transientPresent, present] = usePresent();
    return [transientPresent, present];
}

export function useRawSceneDispatch(): React.Dispatch<SceneAction | UndoRedoAction<EditorState>> {
    const [, , dispatch] = usePresent();
    return dispatch;
}

export interface SceneContext {
    scene: Scene;
    step: SceneStep;
    stepIndex: number;
    source?: FileSource;
    dispatch: React.Dispatch<SceneAction | UndoRedoAction<EditorState>>;

    /** The latest scene prior to any transient updates. */
    canonicalScene: Scene;
}

export function useScene(): SceneContext {
    const [transientPresent, present, dispatch] = usePresent();
    const [source] = useContext(SourceContext);
    const collab = useCollaboration();

    const wrappedDispatch = useMemo(() => {
        if (!collab.enabled) {
            return dispatch;
        }

        return (action: SceneAction | UndoRedoAction<EditorState>) => {
            // Never sync undo/redo stack operations.
            if (!('type' in action)) {
                dispatch(action);
                return;
            }
            if (
                action.type === 'undo' ||
                action.type === 'redo' ||
                action.type === 'reset' ||
                action.type === 'commit' ||
                action.type === 'rollback'
            ) {
                dispatch(action);
                return;
            }

            // Don't sync local-only viewer state.
            if (
                action.type === 'setSource' ||
                action.type === 'setStep' ||
                action.type === 'nextStep' ||
                action.type === 'previousStep'
            ) {
                dispatch(action);
                return;
            }

            let toDispatch: SceneAction = action;

            // Ensure object actions are deterministic across clients by including the step index.
            if (
                (toDispatch.type === 'add' ||
                    toDispatch.type === 'remove' ||
                    toDispatch.type === 'move' ||
                    toDispatch.type === 'moveUp' ||
                    toDispatch.type === 'moveDown' ||
                    toDispatch.type === 'moveToTop' ||
                    toDispatch.type === 'moveToBottom' ||
                    toDispatch.type === 'update') &&
                toDispatch.stepIndex === undefined
            ) {
                toDispatch = { ...toDispatch, stepIndex: transientPresent.currentStep } as SceneAction;
            }

            // In collaborative mode, assign IDs client-locally and carry nextId forward explicitly.
            if (toDispatch.type === 'add') {
                const prepared = collab.prepareAddAction(toDispatch, transientPresent.scene);
                toDispatch = prepared;
            }

            // In collaborative mode, add-step must be deterministic (copy + ID assignment).
            if (toDispatch.type === 'addStep' && !toDispatch.step) {
                const prepared = collab.prepareAddStepAction(toDispatch, transientPresent);
                toDispatch = prepared;
            }

            dispatch(toDispatch);
            collab.pushSceneAction(toDispatch);
        };
    }, [collab, dispatch, transientPresent]);

    return {
        scene: transientPresent.scene,
        canonicalScene: present.scene,
        step: getCurrentStep(transientPresent),
        stepIndex: transientPresent.currentStep,
        source: source,
        dispatch: wrappedDispatch,
    };
}

export function useCurrentStep(): SceneStep {
    const [present] = usePresent();
    return getCurrentStep(present);
}

export function useFloor(): Floor {
    const { scene } = useScene();
    return scene.arena.floor ?? DEFAULT_FLOOR;
}

export function usePadding(): Padding {
    const { scene } = useScene();
    const { background } = scene.arena;
    const padding = background?.padding ?? DEFAULT_ARENA_PADDING;
    const top = typeof padding === 'number' ? padding : padding.top;
    const bottom = typeof padding === 'number' ? padding : padding.bottom;
    const left = typeof padding === 'number' ? padding : padding.left;
    const right = typeof padding === 'number' ? padding : padding.right;
    return {
        top,
        bottom,
        left,
        right,
    };
}

export const useSceneUndoRedoPossible = useUndoRedoPossible;

export function useLoadScene(): (scene: Scene, source?: FileSource) => void {
    const { dispatch } = useScene();
    const setSavedState = useSetSavedState();
    const [, setSource] = useContext(SourceContext);

    return (scene: Scene, source?: FileSource) => {
        dispatch({ type: 'reset', state: { scene, currentStep: 0 } });
        setSavedState(scene);
        setSource(source);
    };
}

export function useSetSource(): Dispatch<SetStateAction<FileSource | undefined>> {
    const [, setSource] = useContext(SourceContext);
    return setSource;
}

export function getObjectById(scene: Scene, id: number): SceneObject | undefined {
    for (const step of scene.steps) {
        const object = step.objects.find((o) => o.id === id);
        if (object) {
            return object;
        }
    }

    return undefined;
}

function getTetherIndex(objects: readonly SceneObject[], tether: Tether): number {
    // Tethers should be created below their targets.
    let startIdx = objects.findIndex((x) => x.id === tether.startId);
    let endIdx = objects.findIndex((x) => x.id === tether.endId);

    if (startIdx < 0) {
        startIdx = objects.length;
    }
    if (endIdx < 0) {
        endIdx = objects.length;
    }
    return Math.min(startIdx, endIdx);
}

function assignObjectIds(
    scene: Readonly<Scene>,
    objects: readonly SceneObjectWithoutId[],
): { objects: SceneObject[]; nextId: number } {
    let nextId = scene.nextId;

    // Track existing IDs across the entire scene, and IDs we assign in this batch.
    const usedIds = new Set<number>();
    for (const step of scene.steps) {
        for (const obj of step.objects) {
            usedIds.add(obj.id);
        }
    }

    const newObjects: SceneObject[] = [];
    for (const obj of objects) {
        let id = obj.id;

        if (id === undefined) {
            // Find the next available sequential ID.
            while (usedIds.has(nextId)) {
                nextId++;
            }
            id = nextId++;
        } else if (usedIds.has(id)) {
            // Provided ID collides with an existing object (or a duplicate within this batch).
            console.error(`Cannot create new object with already-used ID ${id}`);
            continue;
        }

        usedIds.add(id);
        newObjects.push({ ...(obj as Omit<SceneObject, 'id'>), id } as SceneObject);
    }

    return {
        objects: newObjects,
        nextId,
    };
}

function setStep(state: Readonly<EditorState>, index: number): EditorState {
    if (index === state.currentStep) {
        return state;
    }
    return {
        ...state,
        currentStep: clamp(index, 0, state.scene.steps.length - 1),
    };
}

function addStep(state: Readonly<EditorState>, after: number): EditorState {
    const copy = copyObjects(state.scene, getCurrentStep(state).objects);
    const { objects, nextId } = assignObjectIds(state.scene, copy);

    const newStep: SceneStep = { objects };

    const steps = state.scene.steps.slice();
    steps.splice(after + 1, 0, newStep);

    return {
        ...state,
        scene: { ...state.scene, nextId, steps },
        currentStep: after + 1,
    };
}

function removeStep(state: Readonly<EditorState>, index: number): EditorState {
    const newSteps = state.scene.steps.slice();
    newSteps.splice(index, 1);

    if (newSteps.length === 0) {
        newSteps.push({ objects: [] });
    }

    let currentStep = state.currentStep;
    if (index === currentStep) {
        currentStep--;
    }
    currentStep = clamp(currentStep, 0, newSteps.length - 1);

    return {
        ...state,
        scene: {
            ...state.scene,
            steps: newSteps,
        },
        currentStep,
    };
}

function reoderSteps(state: Readonly<EditorState>, order: number[]): EditorState {
    const newSteps = order.map((index) => state.scene.steps[index]).filter((step) => step !== undefined);

    return {
        ...state,
        scene: {
            ...state.scene,
            steps: newSteps,
        },
    };
}

function updateStep(scene: Readonly<Scene>, index: number, step: SceneStep): Scene {
    const result: Scene = {
        nextId: scene.nextId,
        arena: scene.arena,
        steps: [...scene.steps],
    };
    result.steps[index] = step;
    return result;
}

function resolveStepIndex(state: Readonly<EditorState>, stepIndex: number | undefined): number {
    const idx = stepIndex ?? state.currentStep;
    return clamp(idx, 0, state.scene.steps.length - 1);
}

function updateStepByIndex(state: Readonly<EditorState>, stepIndex: number, step: SceneStep): EditorState {
    return {
        ...state,
        scene: updateStep(state.scene, stepIndex, step),
    };
}

function addObjects(
    state: Readonly<EditorState>,
    objects: SceneObjectWithoutId | readonly SceneObjectWithoutId[],
    stepIndex?: number,
    overrideNextId?: number,
): EditorState {
    const idx = resolveStepIndex(state, stepIndex);
    const currentStep = getStepAt(state.scene, idx);

    const { objects: addedObjects, nextId } = assignObjectIds(state.scene, asArray(objects));

    const newObjects = [...currentStep.objects];

    for (const object of addedObjects) {
        if (isTether(object)) {
            newObjects.splice(getTetherIndex(newObjects, object), 0, object);
        } else {
            newObjects.push(object);
        }
    }

    const effectiveNextId = overrideNextId ?? nextId;
    return {
        ...state,
        scene: {
            ...updateStep(state.scene, idx, { objects: newObjects }),
            nextId: effectiveNextId,
        },
    };
}

function removeObjects(state: Readonly<EditorState>, ids: readonly number[], stepIndex?: number): EditorState {
    const idx = resolveStepIndex(state, stepIndex);
    const currentStep = getStepAt(state.scene, idx);

    const objects = currentStep.objects.filter((object) => {
        if (ids.includes(object.id)) {
            return false;
        }

        if (isTether(object)) {
            // Delete any tether that is tethered to a deleted object.
            return !ids.includes(object.startId) && !ids.includes(object.endId);
        }

        return true;
    });

    return updateStepByIndex(state, idx, { objects });
}

function moveObject(state: Readonly<EditorState>, from: number, to: number, stepIndex?: number): EditorState {
    if (from === to) {
        return state;
    }

    const idx = resolveStepIndex(state, stepIndex);
    const currentStep = getStepAt(state.scene, idx);

    const objects = currentStep.objects.slice();
    const items = objects.splice(from, 1);
    objects.splice(to, 0, ...items);

    return updateStepByIndex(state, idx, { objects });
}

function mapSelected(step: Readonly<SceneStep>, ids: readonly number[]) {
    return step.objects.map((object) => ({ object, selected: ids.includes(object.id) }));
}

function unmapSelected(objects: { object: SceneObject; selected: boolean }[]): SceneStep {
    return {
        objects: objects.map((o) => o.object),
    };
}

function moveGroupUp(state: Readonly<EditorState>, ids: readonly number[], stepIndex?: number): EditorState {
    const idx = resolveStepIndex(state, stepIndex);
    const currentStep = getStepAt(state.scene, idx);
    const objects = mapSelected(currentStep, ids);

    for (let i = objects.length - 1; i > 0; i--) {
        const current = objects[i];
        const next = objects[i - 1];

        if (current && next && !current.selected && next.selected) {
            objects[i] = next;
            objects[i - 1] = current;
        }
    }

    return updateStepByIndex(state, idx, unmapSelected(objects));
}

function moveGroupDown(state: Readonly<EditorState>, ids: readonly number[], stepIndex?: number): EditorState {
    const idx = resolveStepIndex(state, stepIndex);
    const currentStep = getStepAt(state.scene, idx);
    const objects = mapSelected(currentStep, ids);

    for (let i = 0; i < objects.length - 1; i++) {
        const current = objects[i];
        const next = objects[i + 1];

        if (current && next && !current.selected && next.selected) {
            objects[i] = next;
            objects[i + 1] = current;
        }
    }

    return updateStepByIndex(state, idx, unmapSelected(objects));
}

function moveGroupToTop(state: Readonly<EditorState>, ids: readonly number[], stepIndex?: number): EditorState {
    const idx = resolveStepIndex(state, stepIndex);
    const currentStep = getStepAt(state.scene, idx);
    const objects = mapSelected(currentStep, ids);

    objects.sort((a, b) => {
        return (a.selected ? 1 : 0) - (b.selected ? 1 : 0);
    });

    return updateStepByIndex(state, idx, unmapSelected(objects));
}

function moveGroupToBottom(state: Readonly<EditorState>, ids: readonly number[], stepIndex?: number): EditorState {
    const idx = resolveStepIndex(state, stepIndex);
    const currentStep = getStepAt(state.scene, idx);
    const objects = mapSelected(currentStep, ids);

    objects.sort((a, b) => {
        return (b.selected ? 1 : 0) - (a.selected ? 1 : 0);
    });

    return updateStepByIndex(state, idx, unmapSelected(objects));
}

function updateObjects(state: Readonly<EditorState>, values: readonly SceneObject[], stepIndex?: number): EditorState {
    const idx = resolveStepIndex(state, stepIndex);
    const currentStep = getStepAt(state.scene, idx);
    const objects = currentStep.objects.slice();

    for (const update of asArray(values)) {
        const index = objects.findIndex((o) => o.id === update.id);
        if (index >= 0) {
            objects[index] = update;
        }
    }

    return updateStepByIndex(state, idx, { objects });
}

function updateArena(state: Readonly<EditorState>, arena: Arena): EditorState {
    return {
        scene: { ...state.scene, arena },
        currentStep: state.currentStep,
    };
}

function sceneReducer(state: Readonly<EditorState>, action: SceneAction): EditorState {
    switch (action.type) {
        case 'setStep':
            return setStep(state, action.index);

        case 'nextStep':
            if (state.currentStep === state.scene.steps.length - 1) {
                return state;
            }
            return setStep(state, state.currentStep + 1);

        case 'previousStep':
            if (state.currentStep === 0) {
                return state;
            }
            return setStep(state, state.currentStep - 1);

        case 'addStep': {
            const after = action.after ?? state.currentStep;
            if (action.step) {
                const steps = state.scene.steps.slice();
                steps.splice(after + 1, 0, action.step);
                return {
                    ...state,
                    scene: { ...state.scene, steps, nextId: action.nextId ?? state.scene.nextId },
                    currentStep: after + 1,
                };
            }
            return addStep(state, after);
        }

        case 'removeStep':
            return removeStep(state, action.index);

        case 'reoderSteps':
            return reoderSteps(state, action.order);

        case 'arena':
            return updateArena(state, action.value);

        case 'arenaBackgroundColor':
            return updateArena(state, {
                ...state.scene.arena,
                background: { ...state.scene.arena.background, color: action.value },
            });

        case 'arenaBackgroundOpacity':
            return updateArena(state, {
                ...state.scene.arena,
                background: { ...state.scene.arena.background, opacity: action.value },
            });

        case 'arenaBackgroundPadding':
            return updateArena(state, {
                ...state.scene.arena,
                background: { ...state.scene.arena.background, padding: action.value },
            });

        case 'arenaFloorShape':
            return updateArena(state, {
                ...state.scene.arena,
                floor: { ...(state.scene.arena.floor ?? DEFAULT_FLOOR), shape: action.value },
            });

        case 'arenaFloorColor':
            return updateArena(state, {
                ...state.scene.arena,
                floor: { ...(state.scene.arena.floor ?? DEFAULT_FLOOR), color: action.value },
            });

        case 'arenaFloorOpacity':
            return updateArena(state, {
                ...state.scene.arena,
                floor: { ...(state.scene.arena.floor ?? DEFAULT_FLOOR), opacity: action.value },
            });

        case 'arenaFloorWidth':
            return updateArena(state, {
                ...state.scene.arena,
                floor: { ...(state.scene.arena.floor ?? DEFAULT_FLOOR), width: action.value },
            });

        case 'arenaFloorHeight':
            return updateArena(state, {
                ...state.scene.arena,
                floor: { ...(state.scene.arena.floor ?? DEFAULT_FLOOR), height: action.value },
            });

        case 'arenaTextureUrl':
            return updateArena(state, {
                ...state.scene.arena,
                texture: { ...state.scene.arena.texture, url: action.value },
            });

        case 'arenaTextureOpacity':
            return updateArena(state, {
                ...state.scene.arena,
                texture: { ...state.scene.arena.texture, opacity: action.value },
            });

        case 'arenaTextureOffsetX':
            return updateArena(state, {
                ...state.scene.arena,
                texture: { ...state.scene.arena.texture, offsetX: action.value },
            });

        case 'arenaTextureOffsetY':
            return updateArena(state, {
                ...state.scene.arena,
                texture: { ...state.scene.arena.texture, offsetY: action.value },
            });

        case 'arenaTextureWidth':
            return updateArena(state, {
                ...state.scene.arena,
                texture: { ...state.scene.arena.texture, width: action.value },
            });

        case 'arenaTextureHeight':
            return updateArena(state, {
                ...state.scene.arena,
                texture: { ...state.scene.arena.texture, height: action.value },
            });

        case 'arenaGrid':
            return updateArena(state, { ...state.scene.arena, grid: action.value });

        case 'arenaGridStroke':
            return updateArena(state, {
                ...state.scene.arena,
                grid: { ...(state.scene.arena.grid ?? NO_GRID), stroke: action.value },
            });

        case 'arenaGridOpacity':
            return updateArena(state, {
                ...state.scene.arena,
                grid: { ...(state.scene.arena.grid ?? NO_GRID), opacity: action.value },
            });

        case 'arenaTicks':
            return updateArena(state, { ...state.scene.arena, ticks: action.value });

        case 'add':
            return addObjects(state, action.object, action.stepIndex, action.nextId);

        case 'remove':
            return removeObjects(state, asArray(action.ids), action.stepIndex);

        case 'move':
            return moveObject(state, action.from, action.to, action.stepIndex);

        case 'moveUp':
            return moveGroupUp(state, asArray(action.ids), action.stepIndex);

        case 'moveDown':
            return moveGroupDown(state, asArray(action.ids), action.stepIndex);

        case 'moveToTop':
            return moveGroupToTop(state, asArray(action.ids), action.stepIndex);

        case 'moveToBottom':
            return moveGroupToBottom(state, asArray(action.ids), action.stepIndex);

        case 'update':
            return updateObjects(state, asArray(action.value), action.stepIndex);
    }

    return state;
}
