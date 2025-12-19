import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Group, Line, Rect } from 'react-konva';
import Icon from '../../assets/zone/square.svg?react';
import { getPointerAngle, rotateCoord, snapAngle } from '../../coord';
import { getResizeCursor } from '../../cursor';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import AoeRect from '../../lib/aoe/AoeRect';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { ActivePortal } from '../../render/Portals';
import { ObjectType, RectangleZone } from '../../scene';
import { useScene } from '../../SceneProvider';
import { useIsDragging } from '../../selection';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { MIN_SIZE } from '../bounds';
import { CONTROL_POINT_BORDER_COLOR } from '../control-point';
import { createControlPointManager, HandleFuncProps, HandleStyle } from '../ControlPoint';
import { DraggableObject } from '../DraggableObject';
import { HideGroup } from '../HideGroup';
import { useHighlightProps, useShowResizer } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { getZoneStyle } from './style';

const DEFAULT_SIZE = 150;
const ICON_SIZE = 32;

export const ZoneRect: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('objects.rectangle', { defaultValue: 'Rectangle' })}
            icon={<Icon />}
            onDragStart={(e) => {
                const offset = getDragOffset(e);
                setDragObject({
                    object: {
                        type: ObjectType.Rect,
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

registerDropHandler<RectangleZone>(ObjectType.Rect, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Rect,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            native: true,
            ...object,
            ...position,
        },
    };
});

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;
const ROTATE_HANDLE_DISTANCE = 30;

enum HandleId {
    TopMid,
    RightMid,
    BottomMid,
    LeftMid,
    TopLeft,
    TopRight,
    BottomRight,
    BottomLeft,
    Rotation,
}

interface RectangleState {
    width: number;
    height: number;
    rotation: number;
    dx?: number;
    dy?: number;
}

function getWidth(object: RectangleZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos) {
        const hw0 = object.width / 2;
        const local = rotateCoord(pointerPos, -object.rotation);
        switch (activeHandleId) {
            // 左侧相关：以右侧为锚点，仅移动左侧
            case HandleId.LeftMid:
            case HandleId.TopLeft:
            case HandleId.BottomLeft: {
                return Math.max(MIN_SIZE, Math.round(hw0 - local.x));
            }
            // 右侧相关：以左侧为锚点，仅移动右侧
            case HandleId.RightMid:
            case HandleId.TopRight:
            case HandleId.BottomRight: {
                return Math.max(MIN_SIZE, Math.round(hw0 + local.x));
            }
        }
    }
    return object.width;
}

function getHeight(object: RectangleZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos) {
        const hh0 = object.height / 2;
        const local = rotateCoord(pointerPos, -object.rotation);
        switch (activeHandleId) {
            // 上侧相关：以下侧为锚点，仅移动上侧
            case HandleId.TopMid:
            case HandleId.TopLeft:
            case HandleId.TopRight: {
                return Math.max(MIN_SIZE, Math.round(hh0 + local.y));
            }
            // 下侧相关：以上侧为锚点，仅移动下侧
            case HandleId.BottomMid:
            case HandleId.BottomLeft:
            case HandleId.BottomRight: {
                return Math.max(MIN_SIZE, Math.round(hh0 - local.y));
            }
        }
    }
    return object.height;
}

function getRotation(object: RectangleZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Rotation) {
        const angle = getPointerAngle(pointerPos);
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }
    return object.rotation;
}

function getCenterOffset(object: RectangleZone, handle: HandleFuncProps) {
    const { pointerPos, activeHandleId } = handle;
    if (!pointerPos || activeHandleId === HandleId.Rotation) {
        return { x: 0, y: 0 };
    }

    const width = getWidth(object, handle);
    const height = getHeight(object, handle);

    const hw0 = object.width / 2;
    const hh0 = object.height / 2;
    const hw = width / 2;
    const hh = height / 2;

    // compute in local axes
    let local = { x: 0, y: 0 };
    switch (activeHandleId) {
        case HandleId.LeftMid:
            local = { x: hw0 - hw, y: 0 };
            break;
        case HandleId.RightMid:
            local = { x: -hw0 + hw, y: 0 };
            break;
        case HandleId.TopMid:
            local = { x: 0, y: hh - hh0 };
            break;
        case HandleId.BottomMid:
            local = { x: 0, y: -hh + hh0 };
            break;
        case HandleId.TopLeft:
            local = { x: hw0 - hw, y: hh - hh0 };
            break;
        case HandleId.TopRight:
            local = { x: -hw0 + hw, y: hh - hh0 };
            break;
        case HandleId.BottomRight:
            local = { x: -hw0 + hw, y: -hh + hh0 };
            break;
        case HandleId.BottomLeft:
            local = { x: hw0 - hw, y: -hh + hh0 };
            break;
        default:
            local = { x: 0, y: 0 };
    }
    return local;
}

const RectangleControlPoints = createControlPointManager<RectangleZone, RectangleState>({
    handleFunc: (object, handle) => {
        const width = getWidth(object, handle);
        const height = getHeight(object, handle);
        const rotation = getRotation(object, handle);
        const { x: dx, y: dy } = getCenterOffset(object, handle);

        const hw = width / 2;
        const hh = height / 2;

        return [
            {
                id: HandleId.TopMid,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation),
                x: 0 + dx,
                y: -hh - dy,
            },
            {
                id: HandleId.RightMid,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 90),
                x: hw + dx,
                y: 0 - dy,
            },
            {
                id: HandleId.BottomMid,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation),
                x: 0 + dx,
                y: hh - dy,
            },
            {
                id: HandleId.LeftMid,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 90),
                x: -hw + dx,
                y: 0 - dy,
            },

            {
                id: HandleId.TopLeft,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation - 45),
                x: -hw + dx,
                y: -hh - dy,
            },
            {
                id: HandleId.TopRight,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 45),
                x: hw + dx,
                y: -hh - dy,
            },
            {
                id: HandleId.BottomRight,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 135),
                x: hw + dx,
                y: hh - dy,
            },
            {
                id: HandleId.BottomLeft,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation - 135),
                x: -hw + dx,
                y: hh - dy,
            },

            {
                id: HandleId.Rotation,
                style: HandleStyle.Square,
                cursor: 'crosshair',
                x: 0 + dx,
                y: -(hh + ROTATE_HANDLE_DISTANCE) - dy,
            },
        ];
    },
    getRotation: getRotation,
    getCenterOffset: getCenterOffset,
    stateFunc: (object, handle) => {
        const width = getWidth(object, handle);
        const height = getHeight(object, handle);
        const rotation = getRotation(object, handle);
        const { x: dx, y: dy } = getCenterOffset(object, handle);
        return { width, height, rotation, dx, dy };
    },
    onRenderBorder: (object, state) => {
        const strokeWidth = 1;
        const width = state.width + strokeWidth * 2;
        const height = state.height + strokeWidth * 2;
        const xLocal = -width / 2 + (state.dx ?? 0);
        const yLocal = -height / 2 - (state.dy ?? 0);
        return (
            <>
                <Rect
                    x={xLocal}
                    y={yLocal}
                    width={width}
                    height={height}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    strokeWidth={strokeWidth}
                    fillEnabled={false}
                />
                <Line
                    points={[
                        state.dx ?? 0,
                        -(state.height / 2) - (state.dy ?? 0),
                        state.dx ?? 0,
                        -(state.height / 2 + ROTATE_HANDLE_DISTANCE) - (state.dy ?? 0),
                    ]}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    strokeWidth={1}
                />
                <Circle
                    x={state.dx ?? 0}
                    y={-(state.dy ?? 0)}
                    radius={CENTER_DOT_RADIUS}
                    fill={CONTROL_POINT_BORDER_COLOR}
                />
            </>
        );
    },
});

interface RectangleRendererProps extends RendererProps<RectangleZone> {
    width: number;
    height: number;
    rotation: number;
    isDragging?: boolean;
    isResizing?: boolean;
    dx?: number;
    dy?: number;
}

const RectangleRenderer: React.FC<RectangleRendererProps> = ({
    object,
    width,
    height,
    rotation,
    isDragging,
    isResizing,
    dx,
    dy,
}) => {
    const highlightProps = useHighlightProps(object);

    // 若 object 没有 native 字段，说明是原版数据，则：
    //   - 如果是空心，则不应用原生样式，以兼容原版数据
    //   - 否则如果是实心，则应用原生样式
    const isNative = object.native ?? object.hollow !== true;
    const isHollow = !isNative && (object.hollow ?? false);

    const style = getZoneStyle(object.color, object.opacity, Math.min(width, height), isHollow);
    const nativeStyle = {
        globalOpacity: object.globalOpacity,
        baseColor: object.baseColor,
        baseOpacity: object.baseOpacity,
        innerGlowColor: object.innerGlowColor,
        innerGlowOpacity: object.innerGlowOpacity,
        outlineColor: object.outlineColor,
        outlineOpacity: object.outlineOpacity,
    };

    const highlightOffset = style.strokeWidth;
    const highlightWidth = width + highlightOffset;
    const highlightHeight = height + highlightOffset;

    const xLocal = dx ?? 0;
    const yLocal = -(dy ?? 0);

    return (
        <Group rotation={rotation}>
            {highlightProps && (
                <Rect
                    x={xLocal}
                    y={yLocal}
                    offsetX={highlightWidth / 2}
                    offsetY={highlightHeight / 2}
                    width={highlightWidth}
                    height={highlightHeight}
                    {...highlightProps}
                />
            )}
            <HideGroup>
                {isNative ? (
                    <AoeRect
                        width={width}
                        height={height}
                        offsetX={width / 2 - (dx ?? 0)}
                        offsetY={height / 2 + (dy ?? 0)}
                        freeze={isResizing}
                        {...nativeStyle}
                    />
                ) : (
                    <Rect
                        x={xLocal}
                        y={yLocal}
                        width={width}
                        height={height}
                        offsetX={width / 2}
                        offsetY={height / 2}
                        {...style}
                    />
                )}

                {isDragging && !isResizing && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </Group>
    );
};

function stateChanged(object: RectangleZone, state: RectangleState) {
    if (state.width !== object.width || state.height !== object.height || state.rotation !== object.rotation) {
        return true;
    }

    const offset = rotateCoord({ x: state.dx ?? 0, y: state.dy ?? 0 }, state.rotation ?? object.rotation);
    return offset.x !== 0 || offset.y !== 0;
}

const RectangleContainer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const [resizing, setResizing] = useState(false);
    const dragging = useIsDragging(object);

    const updateObject = (state: RectangleState) => {
        state.rotation = Math.round(state.rotation);
        state.width = Math.round(state.width);
        state.height = Math.round(state.height);

        const centerOffset = rotateCoord({ x: state.dx ?? 0, y: state.dy ?? 0 }, state.rotation);
        const newX = Math.round(object.x + centerOffset.x);
        const newY = Math.round(object.y + centerOffset.y);

        if (!stateChanged(object, state)) {
            return;
        }

        dispatch({
            type: 'update',
            value: { ...object, width: state.width, height: state.height, rotation: state.rotation, x: newX, y: newY },
        });
    };

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object}>
                <RectangleControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {(props) => (
                        <RectangleRenderer object={object} isDragging={dragging} isResizing={resizing} {...props} />
                    )}
                </RectangleControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<RectangleZone>(ObjectType.Rect, LayerName.Ground, RectangleContainer);

const RectangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    // 缩略图颜色：
    // - 朴素样式使用 object.color
    // - 原生样式使用 object.baseColor（若未设置则回退到 DEFAULT_AOE_COLOR）
    const isNative = object.native ?? true;
    const displayColor = isNative ? (object.baseColor ?? DEFAULT_AOE_COLOR) : object.color;
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: displayColor }} />}
            name={t('objects.rectangle', { defaultValue: 'Rectangle' })}
            object={object}
            {...props}
        />
    );
};

registerListComponent<RectangleZone>(ObjectType.Rect, RectangleDetails);
