import { ArcConfig } from 'konva/lib/shapes/Arc';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Group, Shape } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { useScene } from '../../SceneProvider';
import Icon from '../../assets/zone/arc.svg?react';
import { getPointerAngle, snapAngle } from '../../coord';
import { getResizeCursor } from '../../cursor';
import AoeArc from '../../lib/aoe/AoeArc';
import { AoeProps } from '../../lib/aoe/aoeProps';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../../render/ObjectRegistry';
import { ActivePortal } from '../../render/Portals';
import { LayerName } from '../../render/layers';
import { AoeArcObject, ObjectType } from '../../scene';
import { useIsDragging } from '../../selection';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_HIGHLIGHT_COLOR, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { clamp, degtorad, mod360 } from '../../util';
import { VEC_ZERO, distance, getIntersectionDistance, vecAtAngle, vecNormal } from '../../vector';
import { HandleFuncProps, HandleStyle, createControlPointManager } from '../ControlPoint';
import { DraggableObject } from '../DraggableObject';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { MAX_CONE_ANGLE, MIN_CONE_ANGLE, MIN_RADIUS } from '../bounds';
import { CONTROL_POINT_BORDER_COLOR } from '../control-point';
import { useHighlightProps, useShowResizer } from '../highlight';
import { getAoeStyle } from './style';

const DEFAULT_RADIUS = 150;
const DEFAULT_INNER_RADIUS = 75;
const DEFAULT_ANGLE = 90;

const ICON_SIZE = 32;

export const AoeArcPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    const icon = new URL('public/prefabs/aoe/arc.webp', import.meta.env.VITE_COS_URL).href;

    return (
        <PrefabIcon
            draggable
            name={t('aoe.arc')}
            icon={icon}
            onDragStart={(e) => {
                const offset = getDragOffset(e);
                setDragObject({
                    object: {
                        type: ObjectType.AoeArc,
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

registerDropHandler<AoeArcObject>(ObjectType.AoeArc, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.AoeArc,
            opacity: 100,
            radius: DEFAULT_RADIUS,
            innerRadius: DEFAULT_INNER_RADIUS,
            coneAngle: DEFAULT_ANGLE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

interface OffsetArcProps extends ArcConfig {
    shapeOffset: number;
}

const OffsetArc: React.FC<OffsetArcProps> = ({ innerRadius, outerRadius, angle, shapeOffset, ...props }) => {
    const angleRad = degtorad(angle);
    const offsetInnerRadius = innerRadius - shapeOffset;
    const offsetOuterRadius = outerRadius + shapeOffset;

    const innerArcX1 = offsetInnerRadius;
    const innerArcY1 = 0;
    const innerArcX2 = offsetInnerRadius * Math.cos(angleRad);
    const innerArcY2 = offsetInnerRadius * Math.sin(angleRad);

    const innerCornerX1 = innerArcX1;
    const innerCornerY1 = innerArcY1 - shapeOffset;
    const innerCornerX2 = innerArcX2 + shapeOffset * Math.cos(angleRad + Math.PI / 2);
    const innerCornerY2 = innerArcY2 + shapeOffset * Math.sin(angleRad + Math.PI / 2);

    const outerArcX1 = offsetOuterRadius;
    const outerArcY1 = 0;
    const outerArcX2 = offsetOuterRadius * Math.cos(angleRad);
    const outerArcY2 = offsetOuterRadius * Math.sin(angleRad);

    const outerCornerX1 = outerArcX1;
    const outerCornerY1 = outerArcY1 - shapeOffset;
    const outerCornerX2 = outerArcX2 + shapeOffset * Math.cos(angleRad + Math.PI / 2);
    const outerCornerY2 = outerArcY2 + shapeOffset * Math.sin(angleRad + Math.PI / 2);

    return (
        <Shape
            {...props}
            sceneFunc={(ctx, shape) => {
                ctx.beginPath();

                ctx.arc(0, 0, offsetInnerRadius, 0, angleRad, false);
                ctx.lineTo(innerCornerX2, innerCornerY2);
                ctx.lineTo(outerCornerX2, outerCornerY2);
                ctx.arc(0, 0, offsetOuterRadius, angleRad, 0, true);
                ctx.lineTo(innerCornerX1, innerCornerY1);
                ctx.lineTo(outerCornerX1, outerCornerY1);

                ctx.closePath();
                ctx.fillStrokeShape(shape);
            }}
        />
    );
};

interface AoeArcRendererProps extends RendererProps<AoeArcObject> {
    isDragging?: boolean;
    isResizing?: boolean;
}

const AoeArcRenderer: React.FC<AoeArcRendererProps> = ({ object, isDragging, isResizing }) => {
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

    const highlightInnerRadius = Math.min(object.radius, object.innerRadius);
    const highlightOuterRadius = Math.max(object.radius, object.innerRadius);

    return (
        <Group rotation={object.rotation - 90 - object.coneAngle / 2}>
            {highlightProps && (
                <OffsetArc
                    outerRadius={highlightOuterRadius}
                    innerRadius={highlightInnerRadius}
                    angle={object.coneAngle}
                    shapeOffset={style.strokeWidth / 2}
                    {...highlightProps}
                />
            )}
            <HideGroup>
                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}

                <AoeArc
                    outerRadius={object.radius}
                    innerRadius={object.innerRadius}
                    angle={object.coneAngle}
                    freeze={isResizing}
                    {...aoeProps}
                />
            </HideGroup>
        </Group>
    );
};

function stateChanged(object: AoeArcObject, state: ArcState) {
    return (
        state.radius !== object.innerRadius ||
        state.innerRadius !== object.innerRadius ||
        state.rotation !== object.rotation ||
        state.coneAngle !== object.coneAngle
    );
}

const AoeArcContainer: React.FC<RendererProps<AoeArcObject>> = ({ object }) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const [resizing, setResizing] = useState(false);
    const dragging = useIsDragging(object);

    const updateObject = (state: ArcState) => {
        state.rotation = Math.round(state.rotation);
        state.coneAngle = Math.round(state.coneAngle);

        if (!stateChanged(object, state)) {
            return;
        }

        dispatch({ type: 'update', value: { ...object, ...state } });
    };

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object}>
                <ArcControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {(props) => (
                        <AoeArcRenderer object={object} isDragging={dragging} isResizing={resizing} {...props} />
                    )}
                </ArcControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<AoeArcObject>(ObjectType.AoeArc, LayerName.Ground, AoeArcContainer);

const AoeArcDetails: React.FC<ListComponentProps<AoeArcObject>> = ({ object, ...props }) => {
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
            name={t('aoe.arc')}
            object={object}
            {...props}
        />
    );
};

registerListComponent<AoeArcObject>(ObjectType.AoeArc, AoeArcDetails);

enum HandleId {
    Radius,
    InnerRadius,
    Angle1,
    Angle2,
}

interface ArcState {
    radius: number;
    innerRadius: number;
    rotation: number;
    coneAngle: number;
}

const OUTSET = 2;

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

function getRadius(object: AoeArcObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Radius) {
        return Math.max(MIN_RADIUS, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.radius;
}

function getInnerRadius(object: AoeArcObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.InnerRadius) {
        const u = vecAtAngle(object.rotation);
        const r = getIntersectionDistance(VEC_ZERO, u, pointerPos, vecNormal(u));

        if (!r) {
            return MIN_RADIUS;
        }

        return Math.max(MIN_RADIUS, Math.round(r + OUTSET));
    }

    return object.innerRadius;
}

function getRotation(object: AoeArcObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Radius) {
        const angle = getPointerAngle(pointerPos);
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }

    return object.rotation;
}

function getConeAngle(object: AoeArcObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos) {
        const angle = getPointerAngle(pointerPos);

        if (activeHandleId === HandleId.Angle1) {
            const coneAngle = snapAngle(
                mod360(angle - object.rotation + 90) - 90,
                ROTATE_SNAP_DIVISION,
                ROTATE_SNAP_TOLERANCE,
            );
            return clamp(coneAngle * 2, MIN_CONE_ANGLE, MAX_CONE_ANGLE);
        }
        if (activeHandleId === HandleId.Angle2) {
            const coneAngle = snapAngle(
                mod360(angle - object.rotation + 270) - 270,
                ROTATE_SNAP_DIVISION,
                ROTATE_SNAP_TOLERANCE,
            );

            return clamp(-coneAngle * 2, MIN_CONE_ANGLE, MAX_CONE_ANGLE);
        }
    }

    return object.coneAngle;
}

const ArcControlPoints = createControlPointManager<AoeArcObject, ArcState>({
    handleFunc: (object, handle) => {
        const radius = getRadius(object, handle) + OUTSET;
        const innerRadius = getInnerRadius(object, handle) - OUTSET;
        const rotation = getRotation(object, handle);
        const coneAngle = getConeAngle(object, handle);

        const x = radius * Math.sin(degtorad(coneAngle / 2));
        const y = radius * Math.cos(degtorad(coneAngle / 2));

        return [
            { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation), x: 0, y: -radius },
            {
                id: HandleId.InnerRadius,
                style: HandleStyle.Diamond,
                cursor: getResizeCursor(rotation),
                x: 0,
                y: -innerRadius,
            },
            { id: HandleId.Angle1, style: HandleStyle.Diamond, cursor: 'crosshair', x: x, y: -y },
            { id: HandleId.Angle2, style: HandleStyle.Diamond, cursor: 'crosshair', x: -x, y: -y },
        ];
    },
    getRotation: getRotation,
    stateFunc: (object, handle) => {
        const radius = getRadius(object, handle);
        const innerRadius = getInnerRadius(object, handle);
        const rotation = getRotation(object, handle);
        const coneAngle = getConeAngle(object, handle);

        return { radius, innerRadius, rotation, coneAngle };
    },
    onRenderBorder: (object, state) => {
        const innerRadius = Math.min(state.radius, state.innerRadius);
        const outerRadius = Math.max(state.radius, state.innerRadius);

        return (
            <>
                <Circle radius={CENTER_DOT_RADIUS} fill={CONTROL_POINT_BORDER_COLOR} />
                <OffsetArc
                    rotation={-90 - state.coneAngle / 2}
                    outerRadius={outerRadius}
                    innerRadius={innerRadius}
                    angle={state.coneAngle}
                    shapeOffset={1}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    fillEnabled={false}
                />
            </>
        );
    },
});
