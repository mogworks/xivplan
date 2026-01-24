import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import { TextConfig } from 'konva/lib/shapes/Text';
import * as React from 'react';
import { RefObject, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Arc, Circle, Path, Text } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { LayerName } from '../render/layers';
import { ObjectType, TargetObject, TargetRingStyle } from '../scene';
import {
    CENTER_DOT_RADIUS,
    DEFAULT_TARGET_COLOR,
    DEFAULT_TARGET_OPACITY,
    getTargetTextConfig,
    useSceneTheme,
} from '../theme';
import { useKonvaCache } from '../useKonvaCache';
import { usePanelDrag } from '../usePanelDrag';
import { makeDisplayName } from '../util';
import { HideGroup } from './HideGroup';
import { PrefabIcon } from './PrefabIcon';
import { RadiusObjectContainer } from './RadiusObjectContainer';
import { useHighlightProps } from './highlight';

const DEFAULT_SIZE = 32;

const SIZE_SMALL = 20;
const SIZE_MEDIUM = 50;
const SIZE_LARGE = 80;
const SIZE_HUGE = 300;

const RING_ANGLE = 270;
const RING_ROTATION = 135;
const OUTER_STROKE_RATIO = 1 / 32;
const OUTER_STROKE_MIN = 2;
const INNER_RADIUS_RATIO = 0.85;
const INNER_STROKE_MIN = 1;
const INNER_STROKE_RATIO = 1 / 64;
const SHADOW_BLUR_RATIO = 1 / 10;
const SHADOW_BLUR_MIN = 2;

function makeIcon(defaultNameKey: string, icon: string, radius: number, hasDirection = true) {
    const Component: React.FC = () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = `/actor/${icon}`;
        const { t } = useTranslation();

        return (
            <PrefabIcon
                draggable
                name={t(defaultNameKey)}
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.Target,
                            icon: iconUrl,
                            radius: radius,
                            rotation: 0,
                            ring: hasDirection ? TargetRingStyle.Directional : TargetRingStyle.NoDirection,
                            defaultNameKey,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
    Component.displayName = makeDisplayName(defaultNameKey);
    return Component;
}

registerDropHandler<TargetObject>(ObjectType.Target, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Target,
            icon: '',
            color: DEFAULT_TARGET_COLOR,
            opacity: DEFAULT_TARGET_OPACITY,
            radius: DEFAULT_SIZE,
            status: [],
            ...object,
            ...position,
        },
    };
});

interface RingProps extends ShapeConfig {
    name?: string;
    radius: number;
    color: string;
    highlightProps?: ShapeConfig;
}

interface TargetLabelProps extends TextConfig {
    name?: string;
    radius: number;
}

const TargetLabel: React.FC<TargetLabelProps> = ({ name, radius, ...props }) => {
    if (radius < 32) {
        return null;
    }

    const fontSize = Math.max(10, Math.min(24, radius / 6));
    const strokeWidth = Math.max(1, fontSize / 8);

    return (
        <Text
            text={name}
            width={radius * 2}
            height={radius * 2}
            offsetX={radius}
            offsetY={radius}
            fontSize={fontSize}
            strokeWidth={strokeWidth}
            align="center"
            verticalAlign="middle"
            fillAfterStrokeEnabled
            listening={false}
            {...props}
        />
    );
};

function getInnerRadius(radius: number) {
    return Math.min(radius - 4, radius * INNER_RADIUS_RATIO);
}

function getOuterRadius(radius: number, strokeWidth: number) {
    return radius - strokeWidth / 2;
}

function getShapeProps(color: string, radius: number, strokeRatio: number, minStroke: number) {
    const strokeWidth = Math.max(minStroke, radius * strokeRatio);
    const shadowBlur = Math.max(SHADOW_BLUR_MIN, radius * SHADOW_BLUR_RATIO);

    return {
        stroke: color,
        strokeWidth: strokeWidth,
        shadowColor: color,
        shadowBlur: shadowBlur,
        shadowOpacity: 0.5,
    };
}

const CircleRing: React.FC<RingProps> = ({ radius, color, highlightProps, opacity, ...props }) => {
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const innerRadius = getInnerRadius(radius);
    const outerRadius = getOuterRadius(radius, outerProps.strokeWidth);

    return (
        <>
            {highlightProps && <Circle radius={radius} {...highlightProps} />}

            <HideGroup opacity={opacity} {...props}>
                <Circle {...outerProps} radius={outerRadius} />
                <Circle {...innerProps} radius={innerRadius} />
            </HideGroup>
        </>
    );
};

interface DirectionalRingProps extends RingProps {
    rotation: number;
    groupRef: RefObject<Konva.Group | null>;
}

const DirectionalRing: React.FC<DirectionalRingProps> = ({
    radius,
    color,
    opacity,
    rotation,
    highlightProps,
    groupRef,
    ...props
}) => {
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const innerRadius = getInnerRadius(radius);
    const outerRadius = getOuterRadius(radius, outerProps.strokeWidth);
    const arrowScale = radius / 32;

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [radius, color]);

    return (
        <>
            {highlightProps && <Circle radius={radius} {...highlightProps} />}

            <HideGroup opacity={opacity} ref={groupRef} rotation={rotation} {...props}>
                <Circle radius={radius} fill="transparent" />
                <Arc
                    {...outerProps}
                    rotation={RING_ROTATION}
                    angle={RING_ANGLE}
                    innerRadius={outerRadius}
                    outerRadius={outerRadius}
                />
                <Arc
                    {...innerProps}
                    rotation={RING_ROTATION}
                    angle={RING_ANGLE}
                    innerRadius={innerRadius}
                    outerRadius={innerRadius}
                />
                <Path
                    data="M0-41c-2 2-4 7-4 10 4 0 4 0 8 0 0-3-2-8-4-10"
                    scaleX={arrowScale}
                    scaleY={arrowScale}
                    strokeEnabled={false}
                    fill={color}
                />
            </HideGroup>
        </>
    );
};

const OmnidirectionalRing: React.FC<DirectionalRingProps> = ({
    radius,
    color,
    opacity,
    rotation,
    highlightProps,
    groupRef,
    ...props
}) => {
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const innerRadius = getInnerRadius(radius);
    const outerRadius = getOuterRadius(radius, outerProps.strokeWidth);
    const arrowScale = radius / 42;

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [radius, color]);

    return (
        <>
            {highlightProps && <Circle radius={radius} {...highlightProps} />}

            <HideGroup opacity={opacity} ref={groupRef} rotation={rotation} {...props}>
                <Circle radius={radius} fill="transparent" />

                <Circle {...outerProps} radius={outerRadius} />
                <Circle {...innerProps} radius={innerRadius} />

                <Path
                    data="M0-40c-2 2-4 7-4 10l4-2L4-30c0-3-2-8-4-10"
                    scaleX={arrowScale}
                    scaleY={arrowScale}
                    strokeEnabled={false}
                    fill={color}
                />
            </HideGroup>
        </>
    );
};

interface TargetRendererProps extends RendererProps<TargetObject> {
    radius: number;
    rotation: number;
    groupRef: RefObject<Konva.Group | null>;
    isDragging?: boolean;
}

function renderRing(
    object: TargetObject,
    radius: number,
    rotation: number,
    groupRef: RefObject<Konva.Group | null>,
    highlightProps?: ShapeConfig,
) {
    switch (object.ring) {
        case TargetRingStyle.NoDirection:
            return (
                <CircleRing
                    radius={radius}
                    color={object.color}
                    opacity={object.opacity / 100}
                    highlightProps={highlightProps}
                />
            );

        case TargetRingStyle.Directional:
            return (
                <DirectionalRing
                    radius={radius}
                    rotation={rotation}
                    color={object.color}
                    opacity={object.opacity / 100}
                    highlightProps={highlightProps}
                    groupRef={groupRef}
                />
            );

        case TargetRingStyle.Omnidirectional:
            return (
                <OmnidirectionalRing
                    radius={radius}
                    rotation={rotation}
                    color={object.color}
                    opacity={object.opacity / 100}
                    highlightProps={highlightProps}
                    groupRef={groupRef}
                />
            );
    }
}

const TargetRenderer: React.FC<TargetRendererProps> = ({ object, radius, rotation, groupRef, isDragging }) => {
    const highlightProps = useHighlightProps(object);
    const theme = useSceneTheme();
    const textConfig = getTargetTextConfig(theme);
    // Enemies ring center should only show the user-defined name; ignore nameKey here.
    const displayName = object.name ?? '';

    return (
        <>
            <HideGroup>
                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={object.color} />}

                <TargetLabel name={displayName} radius={radius} color={object.color} {...textConfig} />
            </HideGroup>

            {renderRing(object, radius, rotation, groupRef, highlightProps)}
        </>
    );
};

const TargetContainer: React.FC<RendererProps<TargetObject>> = ({ object }) => {
    const groupRef = useRef<Konva.Group>(null);

    return (
        <RadiusObjectContainer
            object={object}
            allowRotate={object.rotation !== undefined}
            onTransformEnd={() => {
                groupRef.current?.clearCache();
            }}
        >
            {({ radius, rotation, isDragging }) => (
                <TargetRenderer
                    object={object}
                    radius={radius}
                    rotation={rotation}
                    groupRef={groupRef}
                    isDragging={isDragging}
                />
            )}
        </RadiusObjectContainer>
    );
};

registerRenderer<TargetObject>(ObjectType.Target, LayerName.Ground, TargetContainer);

const TargetDetails: React.FC<ListComponentProps<TargetObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = object.name ?? (object.defaultNameKey ? t(object.defaultNameKey) : '');
    return <DetailsItem icon={object.icon} name={name} object={object} {...props} />;
};

registerListComponent<TargetObject>(ObjectType.Target, TargetDetails);

export const TargetCircle = makeIcon('objects.targetCircle', 'target_circle.png', SIZE_SMALL, false);
export const TargetSmall = makeIcon('objects.targetSmall', 'target_small.png', SIZE_SMALL);
export const TargetMedium = makeIcon('objects.targetMedium', 'target_medium.png', SIZE_MEDIUM);
export const TargetLarge = makeIcon('objects.targetLarge', 'target_large.png', SIZE_LARGE);
export const TargetHuge = makeIcon('objects.targetHuge', 'target_huge.png', SIZE_HUGE, false);
