import type { HocuspocusProvider } from '@hocuspocus/provider';
import { createContext, useContext } from 'react';
import * as Y from 'yjs';
import type { SceneAction } from '../SceneProvider';

export interface CollabAPI {
    active: boolean;
    applyLocalAction: (action: SceneAction) => void;
    getProvider: () => HocuspocusProvider | undefined;
    getDoc: () => Y.Doc | undefined;
    clientId?: string;
    undo?: () => void;
    redo?: () => void;
    getUndoRedoPossible?: () => [boolean, boolean];
    getAwarenessStates?: () => Array<{
        clientId?: string;
        name?: string;
        color?: string;
        cursor?: { x: number; y: number };
    }>;
}

export const CollabContext = createContext<CollabAPI>({
    active: false,
    applyLocalAction: () => {},
    getProvider: () => undefined,
    getDoc: () => undefined,
});

export function useCollab() {
    return useContext(CollabContext);
}
