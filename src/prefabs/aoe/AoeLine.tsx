import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Group, Rect } from 'react-konva';
import Icon from '../../assets/zone/line.svg?react';
import { getPointerAngle, snapAngle } from '../../coord';
import { getResizeCursor } from '../../cursor';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { AoeProps } from '../../lib/aoe/aoeProps';
import AoeRect from '../../lib/aoe/AoeRect';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { ActivePortal } from '../../render/Portals';
import { AoeLineObject, ObjectType } from '../../scene';
import { useScene } from '../../SceneProvider';
import { useIsDragging } from '../../selection';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_HIGHLIGHT_COLOR, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { distance, getDistanceFromLine, VEC_ZERO, vecAtAngle } from '../../vector';
import { MIN_LINE_LENGTH, MIN_LINE_WIDTH } from '../bounds';
import { CONTROL_POINT_BORDER_COLOR } from '../control-point';
import { createControlPointManager, HandleFuncProps, HandleStyle } from '../ControlPoint';
import { DraggableObject } from '../DraggableObject';
import { HideGroup } from '../HideGroup';
import { useHighlightProps, useShowResizer } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { getAoeStyle } from './style';

const DEFAULT_WIDTH = 100;
const DEFAULT_LENGTH = 250;

const ICON_SIZE = 32;

export const AoeLinePrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    const icon = new URL('prefabs/aoe/line.webp', import.meta.env.VITE_COS_URL).href;

    return (
        <PrefabIcon
            draggable
            name={t('aoe.line')}
            icon={icon}
            onDragStart={(e) => {
                const offset = getDragOffset(e);
                setDragObject({
                    object: {
                        type: ObjectType.AoeLine,
                    },
                    offset: {
                        x: offset.x,
                        y: offset.y - ICON_SIZE / 2,
                    },
                });
            }}
        />
    );
};

registerDropHandler<AoeLineObject>(ObjectType.AoeLine, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.AoeLine,
            opacity: 100,
            width: DEFAULT_WIDTH,
            length: DEFAULT_LENGTH,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const AoeLineDetails: React.FC<ListComponentProps<AoeLineObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();

    return (
        <DetailsItem
            icon={
                <Icon
                    width="100%"
                    height="100%"
                    style={{ [panelVars.colorZoneOrange]: object.baseColor ?? DEFAULT_AOE_COLOR }}
                />
            }
            name={t('aoe.line')}
            object={object}
            {...props}
        />
    );
};

registerListComponent<AoeLineObject>(ObjectType.AoeLine, AoeLineDetails);

enum HandleId {
    Length,
    Width,
}

interface LineState {
    length: number;
    width: number;
    rotation: number;
}

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

const OUTSET = 2;

function getLength(object: AoeLineObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Length) {
        return Math.max(MIN_LINE_LENGTH, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.length;
}

function getRotation(object: AoeLineObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Length) {
        const angle = getPointerAngle(pointerPos);
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }

    return object.rotation;
}

function getWidth(object: AoeLineObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId == HandleId.Width) {
        const start = VEC_ZERO;
        const end = vecAtAngle(object.rotation);
        const distance = getDistanceFromLine(start, end, pointerPos);

        return Math.max(MIN_LINE_WIDTH, Math.round(distance * 2));
    }

    return object.width;
}

const LineControlPoints = createControlPointManager<AoeLineObject, LineState>({
    handleFunc: (object, handle) => {
        const length = getLength(object, handle) + OUTSET;
        const width = getWidth(object, handle);
        const rotation = getRotation(object, handle);

        const x = width / 2;
        const y = -length / 2;

        return [
            { id: HandleId.Length, style: HandleStyle.Square, cursor: getResizeCursor(rotation), x: 0, y: -length },
            { id: HandleId.Width, style: HandleStyle.Diamond, cursor: getResizeCursor(rotation + 90), x: x, y: y },
            { id: HandleId.Width, style: HandleStyle.Diamond, cursor: getResizeCursor(rotation + 90), x: -x, y: y },
        ];
    },
    getRotation: getRotation,
    stateFunc: (object, handle) => {
        const length = getLength(object, handle);
        const width = getWidth(object, handle);
        const rotation = getRotation(object, handle);

        return { length, width, rotation };
    },
    onRenderBorder: (object, state) => {
        const strokeWidth = 1;
        const width = state.width + strokeWidth * 2;
        const length = state.length + strokeWidth * 2;

        return (
            <>
                <Rect
                    x={-width / 2}
                    y={-length + strokeWidth}
                    width={width}
                    height={length}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    strokeWidth={strokeWidth}
                    fillEnabled={false}
                />
                <Circle radius={CENTER_DOT_RADIUS} fill={CONTROL_POINT_BORDER_COLOR} />
            </>
        );
    },
});

interface AoeLineRendererProps extends RendererProps<AoeLineObject> {
    isDragging?: boolean;
    isResizing?: boolean;
}

const AoeLineRenderer: React.FC<AoeLineRendererProps> = ({ object, isDragging, isResizing }) => {
    const highlightProps = useHighlightProps(object);

    const style = getAoeStyle(DEFAULT_AOE_HIGHLIGHT_COLOR, object.opacity, Math.min(object.length, object.width));
    const aoeProps = {
        opacity: object.opacity,
        baseColor: object.baseColor,
        baseOpacity: object.baseOpacity,
        innerGlowColor: object.innerGlowColor,
        innerGlowOpacity: object.innerGlowOpacity,
        outlineColor: object.outlineColor,
        outlineOpacity: object.outlineOpacity,
    } as AoeProps;

    const x = -object.width / 2;
    const y = -object.length;
    const highlightOffset = style.strokeWidth;
    const highlightWidth = object.width + highlightOffset;
    const highlightLength = object.length + highlightOffset;

    return (
        <Group rotation={object.rotation}>
            {highlightProps && (
                <Rect
                    x={x}
                    y={y}
                    width={highlightWidth}
                    height={highlightLength}
                    offsetX={highlightOffset / 2}
                    offsetY={highlightOffset / 2}
                    {...highlightProps}
                />
            )}
            <HideGroup>
                <AoeRect
                    offsetX={-x}
                    offsetY={-y}
                    width={object.width}
                    height={object.length}
                    freeze={isResizing}
                    {...aoeProps}
                />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </Group>
    );
};

function stateChanged(object: AoeLineObject, state: LineState) {
    return state.length !== object.length || state.rotation !== object.rotation || state.width !== object.width;
}

const AoeLineContainer: React.FC<RendererProps<AoeLineObject>> = ({ object }) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const [resizing, setResizing] = useState(false);
    const dragging = useIsDragging(object);

    const updateObject = (state: LineState) => {
        state.rotation = Math.round(state.rotation);
        state.width = Math.round(state.width);

        if (!stateChanged(object, state)) {
            return;
        }

        dispatch({ type: 'update', value: { ...object, ...state } });
    };

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object}>
                <LineControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {(props) => (
                        <AoeLineRenderer
                            object={object}
                            isDragging={dragging || resizing}
                            isResizing={resizing}
                            {...props}
                        />
                    )}
                </LineControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<AoeLineObject>(ObjectType.AoeLine, LayerName.Ground, AoeLineContainer);
