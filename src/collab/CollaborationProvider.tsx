/* eslint-disable react-refresh/only-export-components */
import React, {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { copyObjects } from '../copy';
import { sceneToText, textToScene } from '../file';
import { getPartyIconUrl, PartyIcons } from '../prefabs/partyIcon';
import { DEFAULT_SCENE, Scene, SceneObject, SceneObjectWithoutId, SceneStep } from '../scene';
import type { AddStepAction, EditorState, ObjectAddAction, SceneAction } from '../SceneProvider';
import type { UndoRedoAction } from '../undo/undoReducer';
import { getCollabRoomFromHash, setCollabRoomHash } from './link';

const LOCAL_ORIGIN = Symbol('collab-local-origin');

export interface CollabUserInfo {
    name: string;
    icon: string; // URL
    id: string; // Persistent user ID
}

export interface CollabCursorInfo {
    x: number;
    y: number;
}

export interface CollabSelectionInfo {
    ids: number[];
}

export interface CollabAwarenessState {
    user?: CollabUserInfo;
    cursor?: CollabCursorInfo;
    selection?: CollabSelectionInfo;
}

export interface CollaborationContextValue {
    enabled: boolean;
    room?: string;
    connected: boolean;

    user: CollabUserInfo;
    setUserName: (name: string) => void;
    setUserIcon: (iconUrl: string) => void;

    enable: () => void;
    disable: () => void;

    /** Push a scene-modifying action to the shared log. */
    pushSceneAction: (action: SceneAction) => void;
    /** Prepare an add action (assign IDs / nextId) for collaborative determinism. */
    prepareAddAction: (action: ObjectAddAction, scene: Scene) => ObjectAddAction;
    /** Prepare add-step action (copy step with deterministic IDs). */
    prepareAddStepAction: (action: AddStepAction, transient: EditorState) => AddStepAction;

    /** Allocate a unique object id for this session/client. */
    allocateObjectId: () => number;

    /** Update local cursor position (scene coordinates). */
    setLocalCursor: (cursor: CollabCursorInfo | undefined) => void;

    /** Update local selection (object ids). */
    setLocalSelection: (ids: number[]) => void;

    /** Current awareness states keyed by clientId. */
    getAwarenessStates: () => Map<number, CollabAwarenessState>;
    /** Monotonic counter that bumps when awareness changes. */
    awarenessVersion: number;
    localClientId?: number;
}

const DEFAULT_USER: CollabUserInfo = {
    name: 'Anonymous',
    icon: getPartyIconUrl(PartyIcons.Any),
    id: '', // Will be set from localStorage when actually used
};

const CollaborationContext = createContext<CollaborationContextValue>({
    enabled: false,
    connected: false,
    user: DEFAULT_USER,
    setUserName: () => {},
    setUserIcon: () => {},
    enable: () => {},
    disable: () => {},
    pushSceneAction: () => {},
    prepareAddAction: (action) => action,
    prepareAddStepAction: (action) => action,
    allocateObjectId: () => 0,
    setLocalCursor: () => {},
    setLocalSelection: () => {},
    getAwarenessStates: () => new Map(),
    awarenessVersion: 0,
    localClientId: undefined,
});

export function useCollaboration(): CollaborationContextValue {
    return useContext(CollaborationContext);
}

const STORAGE_KEY_NAME = 'xivplan.collab.name';
const STORAGE_KEY_ICON = 'xivplan.collab.icon';
const STORAGE_KEY_USER_ID = 'xivplan.collab.userId';

function getOrCreateUserId(): string {
    let id = localStorage.getItem(STORAGE_KEY_USER_ID);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY_USER_ID, id);
    }
    return id;
}

function readStoredUser(): CollabUserInfo {
    const name = localStorage.getItem(STORAGE_KEY_NAME) ?? DEFAULT_USER.name;
    const icon = localStorage.getItem(STORAGE_KEY_ICON) ?? DEFAULT_USER.icon;
    const id = getOrCreateUserId();
    return { name, icon, id };
}

function maxId(scene: Scene): number {
    let result = scene.nextId;
    for (const step of scene.steps) {
        for (const obj of step.objects) {
            result = Math.max(result, obj.id + 1);
        }
    }
    return result;
}

function maxAssignedId(objects: readonly SceneObjectWithoutId[]): number | undefined {
    let max: number | undefined;
    for (const obj of objects) {
        if (obj.id !== undefined) {
            max = max === undefined ? obj.id : Math.max(max, obj.id);
        }
    }
    return max;
}

function ensureSceneObjectIds(objects: readonly SceneObjectWithoutId[]): SceneObject[] {
    return objects.map((o) => {
        if (o.id === undefined) {
            throw new Error('Collaborative add produced object without id');
        }
        return o as SceneObject;
    });
}

export interface CollaborationProviderProps extends PropsWithChildren {
    present: EditorState;
    rawDispatch: React.Dispatch<SceneAction | UndoRedoAction<EditorState>>;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ present, rawDispatch, children }) => {
    const { hash } = useLocation();

    const [enabled, setEnabled] = useState(false);
    const [connected, setConnected] = useState(false);
    const [room, setRoom] = useState<string | undefined>();
    const [awarenessVersion, setAwarenessVersion] = useState(0);

    const [user, setUser] = useState<CollabUserInfo>(() => readStoredUser());

    const docRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const actionsRef = useRef<Y.Array<SceneAction> | null>(null);
    const baseRef = useRef<Y.Array<string> | null>(null);

    const idSeqRef = useRef(0);
    const localClientIdRef = useRef<number | undefined>(undefined);
    const [localClientId, setLocalClientId] = useState<number | undefined>(undefined);

    const setUserName = useCallback((name: string) => {
        setUser((prev) => {
            const next = { ...prev, name };
            localStorage.setItem(STORAGE_KEY_NAME, name);
            return next;
        });
    }, []);

    const setUserIcon = useCallback((iconUrl: string) => {
        setUser((prev) => {
            const next = { ...prev, icon: iconUrl };
            localStorage.setItem(STORAGE_KEY_ICON, iconUrl);
            return next;
        });
    }, []);

    const allocateId = useCallback((): number => {
        const clientId = localClientIdRef.current;
        if (clientId === undefined) {
            // Fallback: still unique-ish within this tab.
            return Math.floor(Math.random() * 1_000_000_000_000);
        }
        // Ensure we stay within Number.MAX_SAFE_INTEGER by keeping a fixed shift.
        // clientId is typically 32-bit; 2^21 ~= 2.1M IDs per client.
        const SHIFT = 2_097_152;
        const id = clientId * SHIFT + (idSeqRef.current++ % SHIFT);
        return id;
    }, []);

    const getAwarenessStates = useCallback(() => {
        const provider = providerRef.current;
        if (!provider) {
            return new Map<number, CollabAwarenessState>();
        }
        return provider.awareness.getStates() as Map<number, CollabAwarenessState>;
    }, []);

    const setLocalCursor = useCallback((cursor: CollabCursorInfo | undefined) => {
        const provider = providerRef.current;
        if (!provider) {
            return;
        }
        provider.awareness.setLocalStateField('cursor', cursor);
    }, []);

    const setLocalSelection = useCallback((ids: number[]) => {
        const provider = providerRef.current;
        if (!provider) {
            return;
        }
        if (!ids.length) {
            provider.awareness.setLocalStateField('selection', undefined);
            return;
        }
        provider.awareness.setLocalStateField('selection', { ids });
    }, []);

    const pushSceneAction = useCallback((action: SceneAction) => {
        const doc = docRef.current;
        const actions = actionsRef.current;
        if (!doc || !actions) {
            return;
        }

        doc.transact(() => {
            actions.push([action]);
        }, LOCAL_ORIGIN);
    }, []);

    const prepareAddAction = useCallback(
        (action: ObjectAddAction, scene: Scene): ObjectAddAction => {
            const objects = (Array.isArray(action.object) ? action.object : [action.object]).map((o) => ({ ...o }));

            for (const obj of objects) {
                if (obj.id === undefined) {
                    obj.id = allocateId();
                }
            }

            const maxObjId = maxAssignedId(objects);
            const nextId = Math.max(
                maxId(scene),
                action.nextId ?? scene.nextId,
                maxObjId === undefined ? 0 : maxObjId + 1,
            );

            return {
                ...action,
                object: objects,
                nextId,
            };
        },
        [allocateId],
    );

    const prepareAddStepAction = useCallback(
        (action: AddStepAction, transient: EditorState): AddStepAction => {
            const after = action.after ?? transient.currentStep;

            // Copy the current step's objects, but deterministically assign IDs for all copied objects.
            const copied = copyObjects(
                transient.scene,
                transient.scene.steps[transient.currentStep]?.objects ?? [],
                undefined,
                allocateId,
            );
            const objects = ensureSceneObjectIds(copied);

            const step: SceneStep = { objects };
            const maxObjId = maxAssignedId(copied);
            const nextId = Math.max(
                maxId(transient.scene),
                action.nextId ?? transient.scene.nextId,
                maxObjId === undefined ? 0 : maxObjId + 1,
            );

            return {
                ...action,
                after,
                step,
                nextId,
            };
        },
        [allocateId],
    );

    const disable = useCallback(() => {
        setEnabled(false);
        setConnected(false);

        providerRef.current?.destroy();
        providerRef.current = null;

        docRef.current?.destroy();
        docRef.current = null;

        actionsRef.current = null;
        baseRef.current = null;
        localClientIdRef.current = undefined;
        setLocalClientId(undefined);
    }, []);

    const enable = useCallback(() => {
        if (enabled) {
            return;
        }
        const existingRoom = getCollabRoomFromHash(hash);
        const roomId = existingRoom ?? crypto.randomUUID();
        setCollabRoomHash(roomId);
        setRoom(roomId);
        setEnabled(true);
    }, [enabled, hash]);

    // Auto-enable when arriving via a collab link.
    useEffect(() => {
        const roomFromUrl = getCollabRoomFromHash(hash);
        if (!roomFromUrl) {
            return;
        }
        if (!enabled) {
            setRoom(roomFromUrl);
            setEnabled(true);
        }
    }, [enabled, hash]);

    function getWebsocketUrl(): string {
        const proto = location.protocol === 'https:' ? 'wss' : 'ws';
        // In dev, default to a local y-websocket server on 1234.
        const devDefault = `${proto}://${location.hostname}:1234`;
        const prodDefault = `${proto}://${location.host}`;

        const defaultUrl = import.meta.env.DEV ? devDefault : prodDefault;
        return (import.meta.env.VITE_YJS_WS_URL as string | undefined) ?? defaultUrl;
    }

    // Setup / teardown provider.
    useEffect(() => {
        if (!enabled || !room) {
            return;
        }

        const doc = new Y.Doc();
        docRef.current = doc;
        localClientIdRef.current = doc.clientID;
        setLocalClientId(doc.clientID);

        const provider = new WebsocketProvider(getWebsocketUrl(), room, doc, {
            connect: true,
        });
        providerRef.current = provider;

        const actions = doc.getArray<SceneAction>('sceneActions');
        const base = doc.getArray<string>('baseScene');
        actionsRef.current = actions;
        baseRef.current = base;

        const onStatus = ({ status }: { status: 'connected' | 'disconnected' | 'connecting' }) =>
            setConnected(status === 'connected');
        provider.on('status', onStatus);

        const onAwarenessChange = () => setAwarenessVersion((v) => v + 1);
        provider.awareness.on('change', onAwarenessChange);

        // Initialize local awareness.
        provider.awareness.setLocalStateField('user', user);

        // On first sync, set base scene if missing, then replay actions onto the local editor state.
        const onSync = (synced: boolean) => {
            if (!synced) {
                return;
            }

            // If base is empty, assume this client is the initializer and publish the current scene.
            if (base.length === 0) {
                const baseText = sceneToText(present.scene);
                doc.transact(() => {
                    base.push([baseText]);
                }, LOCAL_ORIGIN);
            }

            const baseText = base.get(0);
            let scene: Scene = DEFAULT_SCENE;
            if (baseText) {
                try {
                    scene = textToScene(baseText);
                } catch (ex) {
                    console.error('Failed to parse base scene from collaboration session', ex);
                }
            }

            // Reset local state, then replay all actions.
            rawDispatch({ type: 'reset', state: { scene, currentStep: 0 } });
            for (const action of actions.toArray()) {
                rawDispatch(action);
            }
        };
        provider.on('sync', onSync);

        const onActionsChanged = (event: Y.YArrayEvent<SceneAction>) => {
            if (event.transaction.origin === LOCAL_ORIGIN) {
                return;
            }
            // Apply newly added actions.
            for (const delta of event.changes.delta) {
                if (!delta.insert) {
                    continue;
                }
                const inserted = delta.insert as SceneAction[];
                for (const action of inserted) {
                    rawDispatch(action);
                }
            }
        };
        actions.observe(onActionsChanged);

        return () => {
            actions.unobserve(onActionsChanged);
            provider.off('status', onStatus);
            provider.off('sync', onSync);
            provider.awareness.off('change', onAwarenessChange);
            provider.destroy();
            doc.destroy();
            providerRef.current = null;
            docRef.current = null;
            actionsRef.current = null;
            baseRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, room]);

    // Keep awareness user info in sync.
    useEffect(() => {
        const provider = providerRef.current;
        if (!provider) {
            return;
        }
        provider.awareness.setLocalStateField('user', user);
    }, [user]);

    const value: CollaborationContextValue = useMemo(
        () => ({
            enabled,
            room,
            connected,
            user,
            setUserName,
            setUserIcon,
            enable,
            disable,
            pushSceneAction,
            prepareAddAction,
            prepareAddStepAction,
            allocateObjectId: allocateId,
            setLocalCursor,
            setLocalSelection,
            getAwarenessStates,
            awarenessVersion,
            localClientId,
        }),
        [
            enabled,
            room,
            connected,
            user,
            setUserName,
            setUserIcon,
            enable,
            disable,
            pushSceneAction,
            prepareAddAction,
            prepareAddStepAction,
            allocateId,
            setLocalCursor,
            setLocalSelection,
            getAwarenessStates,
            awarenessVersion,
            localClientId,
        ],
    );

    return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
};
