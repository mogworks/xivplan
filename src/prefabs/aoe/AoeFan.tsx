import { WedgeConfig } from 'konva/lib/shapes/Wedge';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Shape } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { useScene } from '../../SceneProvider';
import Icon from '../../assets/zone/fan.svg?react';
import { getPointerAngle, snapAngle } from '../../coord';
import { getResizeCursor } from '../../cursor';
import AoeWedge from '../../lib/aoe/AoeWedge';
import { AoeProps } from '../../lib/aoe/aoeProps';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../../render/ObjectRegistry';
import { ActivePortal } from '../../render/Portals';
import { LayerName } from '../../render/layers';
import { AoeFanObject, ObjectType } from '../../scene';
import { useIsDragging } from '../../selection';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_HIGHLIGHT_COLOR, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { clamp, degtorad, mod360 } from '../../util';
import { distance } from '../../vector';
import { HandleFuncProps, HandleStyle, createControlPointManager } from '../ControlPoint';
import { DraggableObject } from '../DraggableObject';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { MAX_FAN_ANGLE, MIN_FAN_ANGLE, MIN_RADIUS } from '../bounds';
import { CONTROL_POINT_BORDER_COLOR } from '../control-point';
import { useHighlightProps, useShowResizer } from '../highlight';
import { getAoeStyle } from './style';

const DEFAULT_RADIUS = 150;
const DEFAULT_ANGLE = 90;

const ICON_SIZE = 32;

export const AoeFanPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    const icon = new URL('public/prefabs/aoe/fan.webp', import.meta.env.VITE_COS_URL).href;

    return (
        <PrefabIcon
            draggable
            name={t('aoe.fan')}
            icon={icon}
            onDragStart={(e) => {
                const offset = getDragOffset(e);
                setDragObject({
                    object: {
                        type: ObjectType.AoeFan,
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

registerDropHandler<AoeFanObject>(ObjectType.AoeFan, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.AoeFan,
            opacity: 100,
            radius: DEFAULT_RADIUS,
            fanAngle: DEFAULT_ANGLE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

interface OffsetWedgeProps extends WedgeConfig {
    shapeOffset: number;
}

const OffsetWedge: React.FC<OffsetWedgeProps> = ({ radius, angle, shapeOffset, ...props }) => {
    const angleRad = degtorad(angle);
    const offsetRadius = radius + shapeOffset;

    const arcX1 = offsetRadius;
    const arcY1 = 0;
    const arcX2 = offsetRadius * Math.cos(angleRad);
    const arcY2 = offsetRadius * Math.sin(angleRad);

    const cornerX1 = arcX1;
    const cornerY1 = arcY1 - shapeOffset;
    const cornerX2 = arcX2 + shapeOffset * Math.cos(angleRad + Math.PI / 2);
    const cornerY2 = arcY2 + shapeOffset * Math.sin(angleRad + Math.PI / 2);

    // At 360 degrees, divisor goes to 0. Put the point in the center.
    // At <= 15 degrees, pointDist becomes large and shows a gap with the
    // non-offset shape. Limit pointDist to prevent that.
    const divisor = Math.sin(angleRad / 2);
    const pointDist = Math.min(shapeOffset * 2, divisor <= 0.001 ? 0 : shapeOffset / divisor);

    const pointX = -pointDist * Math.cos(angleRad / 2);
    const pointY = -pointDist * Math.sin(angleRad / 2);

    return (
        <Shape
            {...props}
            sceneFunc={(ctx, shape) => {
                ctx.beginPath();

                ctx.arc(0, 0, offsetRadius, 0, angleRad, false);
                ctx.lineTo(cornerX2, cornerY2);
                ctx.lineTo(pointX, pointY);
                ctx.lineTo(cornerX1, cornerY1);

                ctx.closePath();
                ctx.fillStrokeShape(shape);
            }}
        />
    );
};

interface AoeFanRendererProps extends RendererProps<AoeFanObject> {
    isResizing?: boolean;
}

const AoeFanRenderer: React.FC<AoeFanRendererProps> = ({ object, isResizing }) => {
    const highlightProps = useHighlightProps(object);

    const style = getAoeStyle(DEFAULT_AOE_HIGHLIGHT_COLOR, object.opacity, object.radius * 2);
    const aoeProps = {
        opacity: object.opacity,
        baseColor: object.baseColor,
        baseOpacity: object.baseOpacity,
        innerGlowColor: object.innerGlowColor,
        innerGlowOpacity: object.innerGlowOpacity,
        outlineColor: object.outlineColor,
        outlineOpacity: object.outlineOpacity,
    } as AoeProps;

    return (
        <Group rotation={object.rotation - 90 - object.fanAngle / 2}>
            {highlightProps && (
                <OffsetWedge
                    radius={object.radius}
                    angle={object.fanAngle}
                    shapeOffset={style.strokeWidth / 2}
                    {...highlightProps}
                />
            )}
            <HideGroup>
                <AoeWedge radius={object.radius} angle={object.fanAngle} freeze={isResizing} {...aoeProps} />
            </HideGroup>
        </Group>
    );
};

function stateChanged(object: AoeFanObject, state: FanState) {
    return state.radius !== object.radius || state.rotation !== object.rotation || state.fanAngle !== object.fanAngle;
}

const AoeFanContainer: React.FC<RendererProps<AoeFanObject>> = ({ object }) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const [resizing, setResizing] = useState(false);
    const dragging = useIsDragging(object);

    const updateObject = (state: FanState) => {
        state.rotation = Math.round(state.rotation);
        state.fanAngle = Math.round(state.fanAngle);

        if (!stateChanged(object, state)) {
            return;
        }

        dispatch({ type: 'update', value: { ...object, ...state } });
    };

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object}>
                <FanControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {(props) => <AoeFanRenderer object={object} isResizing={resizing} {...props} />}
                </FanControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<AoeFanObject>(ObjectType.AoeFan, LayerName.Ground, AoeFanContainer);

const AoeFanDetails: React.FC<ListComponentProps<AoeFanObject>> = ({ object, ...props }) => {
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
            name={t('aoe.fan')}
            object={object}
            {...props}
        />
    );
};

registerListComponent<AoeFanObject>(ObjectType.AoeFan, AoeFanDetails);

enum HandleId {
    Radius,
    Angle1,
    Angle2,
}

interface FanState {
    radius: number;
    rotation: number;
    fanAngle: number;
}

const OUTSET = 2;

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

function getRadius(object: AoeFanObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Radius) {
        return Math.max(MIN_RADIUS, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.radius;
}

function getRotation(object: AoeFanObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Radius) {
        const angle = getPointerAngle(pointerPos);
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }

    return object.rotation;
}

function getFanAngle(object: AoeFanObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos) {
        const angle = getPointerAngle(pointerPos);

        if (activeHandleId === HandleId.Angle1) {
            const fanAngle = snapAngle(
                mod360(angle - object.rotation + 90) - 90,
                ROTATE_SNAP_DIVISION,
                ROTATE_SNAP_TOLERANCE,
            );
            return clamp(fanAngle * 2, MIN_FAN_ANGLE, MAX_FAN_ANGLE);
        }
        if (activeHandleId === HandleId.Angle2) {
            const fanAngle = snapAngle(
                mod360(angle - object.rotation + 270) - 270,
                ROTATE_SNAP_DIVISION,
                ROTATE_SNAP_TOLERANCE,
            );

            return clamp(-fanAngle * 2, MIN_FAN_ANGLE, MAX_FAN_ANGLE);
        }
    }

    return object.fanAngle;
}

const FanControlPoints = createControlPointManager<AoeFanObject, FanState>({
    handleFunc: (object, handle) => {
        const radius = getRadius(object, handle) + OUTSET;
        const rotation = getRotation(object, handle);
        const fanAngle = getFanAngle(object, handle);

        const x = radius * Math.sin(degtorad(fanAngle / 2));
        const y = radius * Math.cos(degtorad(fanAngle / 2));

        return [
            { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation), x: 0, y: -radius },
            { id: HandleId.Angle1, style: HandleStyle.Diamond, cursor: 'crosshair', x: x, y: -y },
            { id: HandleId.Angle2, style: HandleStyle.Diamond, cursor: 'crosshair', x: -x, y: -y },
        ];
    },
    getRotation: getRotation,
    stateFunc: (object, handle) => {
        const radius = getRadius(object, handle);
        const rotation = getRotation(object, handle);
        const fanAngle = getFanAngle(object, handle);

        return { radius, rotation, fanAngle };
    },
    onRenderBorder: (object, state) => {
        return (
            <OffsetWedge
                rotation={-90 - state.fanAngle / 2}
                radius={state.radius}
                angle={state.fanAngle}
                shapeOffset={1}
                stroke={CONTROL_POINT_BORDER_COLOR}
                fillEnabled={false}
            />
        );
    },
});
