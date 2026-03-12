import React, { useMemo } from 'react';
import { Circle, Group, Label, Layer, Rect, Tag, Text } from 'react-konva';
import { useScene } from '../SceneProvider';
import { getCanvasCoord } from '../coord';
import {
    isMovable,
    isRadiusObject,
    isRegularResizable,
    isResizable,
    isRotatable,
    SceneObject,
    UnknownObject,
} from '../scene';
import { useCollaboration } from './CollaborationProvider';
import { colorFromUserId } from './userColor';

type Selector = { id: string; name: string };

export const RemoteSelectionLayer: React.FC = () => {
    const collab = useCollaboration();
    const { scene, step } = useScene();

    const selected = useMemo(() => {
        if (!collab.enabled) {
            return new Map<number, Selector[]>();
        }
        const result = new Map<number, Selector[]>();
        for (const [clientId, state] of collab.getAwarenessStates()) {
            if (collab.localClientId !== undefined && clientId === collab.localClientId) {
                continue;
            }
            const user = state.user;
            const sel = state.selection;
            if (!user || !sel?.ids?.length) {
                continue;
            }
            for (const id of sel.ids) {
                const list = result.get(id) ?? [];
                list.push({ id: user.id ?? String(clientId), name: user.name });
                result.set(id, list);
            }
        }
        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collab, collab.enabled, collab.awarenessVersion, collab.localClientId]);

    const objects = useMemo(() => {
        if (!collab.enabled || selected.size === 0) {
            return [];
        }
        const list: Array<{ object: SceneObject; selectors: Selector[] }> = [];
        for (const obj of step.objects) {
            const selectors = selected.get(obj.id);
            if (selectors?.length) {
                list.push({ object: obj, selectors });
            }
        }
        return list;
    }, [collab.enabled, selected, step.objects]);

    if (!collab.enabled || objects.length === 0) {
        return null;
    }

    return (
        <Layer listening={false}>
            {objects.map(({ object, selectors }) => (
                <RemoteSelectionHighlight
                    key={object.id}
                    object={object as UnknownObject}
                    selectors={selectors}
                    scene={scene}
                />
            ))}
        </Layer>
    );
};

interface RemoteSelectionHighlightProps {
    object: UnknownObject;
    selectors: Selector[];
    scene: Parameters<typeof getCanvasCoord>[0];
}

const RemoteSelectionHighlight: React.FC<RemoteSelectionHighlightProps> = ({ object, selectors, scene }) => {
    if (!isMovable(object)) {
        return null;
    }

    const primary = selectors[0];
    if (!primary) {
        return null;
    }
    const accent = colorFromUserId(primary.id);

    const nameText = selectors.length === 1 ? primary.name : `${primary.name} +${selectors.length - 1}`;

    const p = getCanvasCoord(scene, object);

    const rotation = isRotatable(object) ? object.rotation : 0;

    let highlight: React.ReactNode;
    if (isResizable(object)) {
        // Objects with width and height (rectangles)
        const pad = 8;
        const w = object.width + pad;
        const h = object.height + pad;
        highlight = (
            <Rect
                width={w}
                height={h}
                offsetX={w / 2}
                offsetY={h / 2}
                cornerRadius={8}
                fillEnabled={false}
                stroke={accent}
                strokeWidth={2}
                dash={[6, 4]}
                opacity={0.9}
            />
        );
    } else if (isRegularResizable(object)) {
        // Objects with size property (squares like party icons, enemy icons, waymarks)
        const pad = 8;
        const s = object.size + pad;
        highlight = (
            <Rect
                width={s}
                height={s}
                offsetX={s / 2}
                offsetY={s / 2}
                cornerRadius={6}
                fillEnabled={false}
                stroke={accent}
                strokeWidth={2}
                dash={[6, 4]}
                opacity={0.9}
            />
        );
    } else if (isRadiusObject(object)) {
        // Objects with radius (circles)
        highlight = (
            <Circle
                radius={object.radius + 6}
                fillEnabled={false}
                stroke={accent}
                strokeWidth={2}
                dash={[6, 4]}
                opacity={0.9}
            />
        );
    } else {
        // Fallback for other movable objects
        highlight = (
            <Circle radius={16} fillEnabled={false} stroke={accent} strokeWidth={2} dash={[6, 4]} opacity={0.9} />
        );
    }

    return (
        <Group x={p.x} y={p.y} rotation={rotation}>
            {highlight}

            {/* User label (not rotated, keep it readable) */}
            <Group rotation={-rotation}>
                <Label x={18} y={-28} opacity={0.98}>
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
                    <Text text={nameText} fontSize={12} padding={6} fill="#ffffff" />
                </Label>
            </Group>
        </Group>
    );
};
