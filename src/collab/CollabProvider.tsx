import { HocuspocusProvider } from '@hocuspocus/provider';
import { nanoid } from 'nanoid';
import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { UndoManager } from 'yjs';
import type { SetArenaAction } from '../SceneProvider';
import { EditorState, SceneAction, useScene } from '../SceneProvider';
import { CollabAPI, CollabContext } from './CollabContext';
import {
    applyAdd,
    applyAddStep,
    applyArena,
    applyMove,
    applyRemove,
    applyRemoveStep,
    applyReorderSteps,
    applyUpdate,
    createSchema,
    docToScene,
    initDocFromScene,
} from './yjsBridge';

function useRoomId(): string | undefined {
    const { hash } = useLocation();
    if (hash?.startsWith('#/room/')) return hash.substring('#/room/'.length);
    return undefined;
}

export const CollabProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const roomId = useRoomId();
    const active = !!roomId;
    const { canonicalScene, dispatch, stepIndex } = useScene();
    const canonicalSceneRef = useRef(canonicalScene);
    const dispatchRef = useRef(dispatch);
    const stepIndexRef = useRef(stepIndex);

    useEffect(() => {
        canonicalSceneRef.current = canonicalScene;
    }, [canonicalScene]);
    useEffect(() => {
        dispatchRef.current = dispatch;
    }, [dispatch]);
    useEffect(() => {
        stepIndexRef.current = stepIndex;
    }, [stepIndex]);

    const schemaRef = useRef(createSchema());
    const providerRef = useRef<HocuspocusProvider | null>(null);
    const undoManagerRef = useRef<UndoManager | null>(null);
    const [clientId] = useState(() => nanoid());
    const originRef = useRef<object>({});
    const [undoRedoPossible, setUndoRedoPossible] = useState<[boolean, boolean]>([false, false]);
    const [awarenessStates, setAwarenessStates] = useState<
        Array<{ clientId?: string; name?: string; color?: string; cursor?: { x: number; y: number } }>
    >([]);

    useEffect(() => {
        if (!active) return;
        const schema = schemaRef.current;
        const url = import.meta.env.VITE_COLLAB_WS_URL ?? 'ws://127.0.0.1:1234';
        const provider = new HocuspocusProvider({
            url,
            name: roomId!,
            document: schema.doc,
            onSynced: () => {
                if (schema.steps.length === 0) {
                    initDocFromScene(schema, canonicalSceneRef.current);
                    schema.sceneMeta.set('inited', true);
                }
            },
        });
        providerRef.current = provider;
        undoManagerRef.current = new UndoManager([schema.sceneMeta, schema.steps], {
            trackedOrigins: new Set([originRef.current]),
            ignoreRemoteMapChanges: true,
        });
        const name = `User-${clientId.slice(-4)}`;
        const hueSeed = parseInt(clientId.slice(-6), 36) % 360;
        const color = `hsl(${hueSeed} 70% 50%)`;
        const aw = provider.awareness;
        aw?.setLocalState({ clientId, name, color });
        if (aw) {
            const updateAw = () => setAwarenessStates(Array.from(aw.getStates().values()));
            updateAw();
            aw.on('change', updateAw);
            provider.on('disconnect', () => aw.off('change', updateAw));
        }

        const handleUpdate = (_update: Uint8Array, origin: unknown) => {
            if (origin === originRef.current) return;
            const scene = docToScene(schema);
            const state: EditorState = {
                scene,
                currentStep: stepIndexRef.current,
            };
            dispatchRef.current({ type: 'reset', state });
            const um = undoManagerRef.current as unknown as { undoStack?: unknown[]; redoStack?: unknown[] } | null;
            const undoPossible = !!um?.undoStack && Array.isArray(um.undoStack) ? um.undoStack.length > 0 : false;
            const redoPossible = !!um?.redoStack && Array.isArray(um.redoStack) ? um.redoStack.length > 0 : false;
            setUndoRedoPossible([undoPossible, redoPossible]);
        };

        schema.doc.on('update', handleUpdate);
        return () => {
            schema.doc.off('update', handleUpdate);
            provider.destroy();
        };
    }, [active, roomId, clientId]);

    const applyLocalAction = useMemo(() => {
        return (action: SceneAction) => {
            const schema = schemaRef.current;
            const origin = originRef.current;
            switch (action.type) {
                case 'add':
                    applyAdd(schema, stepIndexRef.current, action.object, origin);
                    break;
                case 'remove':
                    applyRemove(schema, stepIndexRef.current, action.ids, origin);
                    break;
                case 'update':
                    applyUpdate(schema, stepIndexRef.current, action.value, origin);
                    break;
                case 'move':
                    applyMove(schema, stepIndexRef.current, action.from, action.to, origin);
                    break;
                case 'arena':
                    applyArena(schema, (action as SetArenaAction).value, origin);
                    break;
                case 'setStep':
                case 'nextStep':
                case 'previousStep':
                    // 步骤选择属于本地会话态，不同步到 Y.Doc
                    break;
                case 'addStep':
                    applyAddStep(schema, action.after, origin);
                    break;
                case 'removeStep':
                    applyRemoveStep(schema, action.index, origin);
                    break;
                case 'reoderSteps':
                    applyReorderSteps(schema, action.order, origin);
                    break;
                default:
                    break;
            }
            undoManagerRef.current?.stopCapturing();
            const um = undoManagerRef.current as unknown as { undoStack?: unknown[]; redoStack?: unknown[] } | null;
            const undoPossible = !!um?.undoStack && Array.isArray(um.undoStack) ? um.undoStack.length > 0 : false;
            const redoPossible = !!um?.redoStack && Array.isArray(um.redoStack) ? um.redoStack.length > 0 : false;
            setUndoRedoPossible([undoPossible, redoPossible]);
        };
    }, [stepIndex]);

    const value: CollabAPI = {
        active,
        applyLocalAction,
        getProvider: () => providerRef.current ?? undefined,
        getDoc: () => schemaRef.current.doc ?? undefined,
        clientId,
        undo: () => {
            undoManagerRef.current?.undo();
            const scene = docToScene(schemaRef.current);
            dispatchRef.current({ type: 'reset', state: { scene, currentStep: stepIndexRef.current } });
        },
        redo: () => {
            undoManagerRef.current?.redo();
            const scene = docToScene(schemaRef.current);
            dispatchRef.current({ type: 'reset', state: { scene, currentStep: stepIndexRef.current } });
        },
        getUndoRedoPossible: () => undoRedoPossible,
        getAwarenessStates: () => awarenessStates,
    };

    return <CollabContext.Provider value={value}>{children}</CollabContext.Provider>;
};
