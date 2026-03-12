import React, { useMemo } from 'react';
import { Group, Image, Label, Layer, Tag, Text } from 'react-konva';
import { useScene } from '../SceneProvider';
import { getCanvasCoord } from '../coord';
import { useImageTracked } from '../useObjectLoading';
import { useCollaboration } from './CollaborationProvider';
import { colorFromUserId } from './userColor';

const ICON_SIZE = 24;

export const RemoteCursorsLayer: React.FC = () => {
    const collab = useCollaboration();
    const { scene } = useScene();

    const cursors = useMemo(() => {
        if (!collab.enabled) {
            return [];
        }
        const states = collab.getAwarenessStates();
        const result: Array<{ id: string; name: string; icon: string; x: number; y: number }> = [];
        for (const [clientId, state] of states) {
            if (collab.localClientId !== undefined && clientId === collab.localClientId) {
                continue;
            }
            const user = state.user;
            const cursor = state.cursor;
            if (!user || !cursor) {
                continue;
            }
            // Cursor is stored in scene coordinates; convert to canvas coordinates for rendering.
            const p = getCanvasCoord(scene, cursor);
            result.push({ id: user.id ?? String(clientId), name: user.name, icon: user.icon, x: p.x, y: p.y });
        }
        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collab.enabled, collab.awarenessVersion, collab.localClientId, collab, scene]);

    if (!collab.enabled || cursors.length === 0) {
        return null;
    }

    return (
        <Layer listening={false}>
            {cursors.map((c) => (
                <RemoteCursor key={c.id} userId={c.id} name={c.name} icon={c.icon} x={c.x} y={c.y} />
            ))}
        </Layer>
    );
};

interface RemoteCursorProps {
    userId: string;
    name: string;
    icon: string;
    x: number;
    y: number;
}

const RemoteCursor: React.FC<RemoteCursorProps> = ({ userId, name, icon, x, y }) => {
    const [image] = useImageTracked(icon);
    const accent = colorFromUserId(userId);

    return (
        <Group x={x} y={y} opacity={0.98}>
            <Image
                image={image}
                width={ICON_SIZE}
                height={ICON_SIZE}
                offsetX={ICON_SIZE / 2}
                offsetY={ICON_SIZE / 2}
                x={0}
                y={0}
                shadowColor="#000000"
                shadowBlur={8}
                shadowOpacity={0.35}
                shadowOffsetX={0}
                shadowOffsetY={2}
            />

            {/* Name tag */}
            <Label x={ICON_SIZE / 2 + 8} y={-ICON_SIZE / 2 - 2} opacity={0.98}>
                <Tag
                    fill="#0b1220"
                    opacity={0.88}
                    cornerRadius={8}
                    stroke={accent}
                    strokeWidth={1}
                    shadowColor="#000000"
                    shadowBlur={8}
                    shadowOpacity={0.35}
                    shadowOffsetX={0}
                    shadowOffsetY={2}
                />
                <Text text={name} fontSize={12} padding={6} fill="#ffffff" />
            </Label>
        </Group>
    );
};
