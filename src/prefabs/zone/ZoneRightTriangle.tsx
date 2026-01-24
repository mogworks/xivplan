import { RectConfig } from 'konva/lib/shapes/Rect';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Line } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/right_triangle.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { ObjectType, RectangleZone } from '../../scene';
import { DEFAULT_AOE_COLOR, DEFAULT_SHAPE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { ResizableObjectContainer } from '../ResizableObjectContainer';
import { useHighlightProps } from '../highlight';
import { getZoneStyle } from './style';

const DEFAULT_RIGHT_TRIANGLE_SIZE = 150;

export const ZoneRightTriangle: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('objects.rightTriangle', { defaultValue: 'Right triangle' })}
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.RightTriangle,
                        width: DEFAULT_RIGHT_TRIANGLE_SIZE,
                        height: DEFAULT_RIGHT_TRIANGLE_SIZE,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.RightTriangle, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.RightTriangle,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_SHAPE_OPACITY,
            width: DEFAULT_RIGHT_TRIANGLE_SIZE,
            height: DEFAULT_RIGHT_TRIANGLE_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const RightTriangle: React.FC<RectConfig> = ({ width, height, ...props }) => {
    const w = width ?? 0;
    const h = height ?? 0;
    // prettier-ignore
    const points = [
        0, 0,
        0, h,
        w, h
    ];

    return <Line points={points} closed {...props} />;
};

const RightTriangleRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const style = getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height), object.hollow);

    const highlightOffset = style.strokeWidth;
    const highlightWidth = object.width + highlightOffset;
    const highlightHeight = object.height + highlightOffset;

    return (
        <ResizableObjectContainer object={object}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {highlightProps && (
                        <RightTriangle
                            offsetX={highlightOffset / 2}
                            offsetY={highlightOffset / 2}
                            width={highlightWidth}
                            height={highlightHeight}
                            {...highlightProps}
                        />
                    )}
                    <HideGroup>
                        <RightTriangle width={object.width} height={object.height} {...style} />
                    </HideGroup>
                </Group>
            )}
        </ResizableObjectContainer>
    );
};

registerRenderer<RectangleZone>(ObjectType.RightTriangle, LayerName.Ground, RightTriangleRenderer);

const RightTriangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={t('objects.rightTriangle', { defaultValue: 'Right triangle' })}
            object={object}
            {...props}
        />
    );
};

registerListComponent<RectangleZone>(ObjectType.RightTriangle, RightTriangleDetails);
