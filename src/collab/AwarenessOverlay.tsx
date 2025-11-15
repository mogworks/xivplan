import React, { useEffect, useState } from 'react';
import { Group, Circle, Text } from 'react-konva';
import { useCollab } from './CollabContext';
import { StageContext } from '../render/StageContext';
import { useContext } from 'react';

interface AwarenessState {
    clientId?: string;
    name?: string;
    color?: string;
    cursor?: { x: number; y: number };
}

export const AwarenessOverlay: React.FC = () => {
    const { getProvider, active, clientId, getAwarenessStates } = useCollab();
    const stage = useContext(StageContext);
    const [states, setStates] = useState<AwarenessState[]>([]);

    useEffect(() => {
        const provider = getProvider();
        if (!active || !provider || !stage) return;
        const handler = () => {
            const p = stage.getPointerPosition();
            if (!p) return;
            provider.awareness?.setLocalStateField('cursor', { x: p.x, y: p.y });
        };
        const el = stage.getContent();
        el.addEventListener('mousemove', handler);
        return () => el.removeEventListener('mousemove', handler);
    }, [active, getProvider, stage]);

    useEffect(() => {
        const update = () => {
            const s = getAwarenessStates?.() ?? [];
            setStates(s as AwarenessState[]);
        };
        update();
        const id = setInterval(update, 100);
        return () => clearInterval(id);
    }, [getAwarenessStates]);

    if (!active) return null;

    return (
        <>
            {states
                .filter((s) => s.clientId !== undefined && s.clientId !== clientId)
                .map((s) => {
                    const c = s.cursor as { x: number; y: number } | undefined;
                    if (!c) return null;
                    const color = s.color as string;
                    const name = s.name as string;
                    return (
                        <Group key={String(s.clientId)} x={c.x} y={c.y} listening={false}>
                            <Circle radius={5} fill={color} opacity={0.9} />
                            <Text text={name ?? 'User'} x={8} y={-6} fill={color} fontSize={12} />
                        </Group>
                    );
                })}
        </>
    );
};
