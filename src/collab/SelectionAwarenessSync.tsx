import React, { useEffect, useMemo } from 'react';
import { useSelection } from '../selection';
import { useCollaboration } from './CollaborationProvider';

export const SelectionAwarenessSync: React.FC = () => {
    const collab = useCollaboration();
    const [selection] = useSelection();

    const ids = useMemo(() => Array.from(selection), [selection]);

    useEffect(() => {
        if (!collab.enabled) {
            return;
        }
        collab.setLocalSelection(ids);
    }, [collab, collab.enabled, ids]);

    useEffect(() => {
        if (!collab.enabled) {
            collab.setLocalSelection([]);
        }
    }, [collab, collab.enabled]);

    return null;
};
