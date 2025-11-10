import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/square.svg?react';
import AoeRect from '../../lib/aoe/AoeRect';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { ObjectType, RectangleZone } from '../../scene';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { useHighlightProps } from '../highlight';
import { getZoneStyle } from './style';

const DEFAULT_SIZE = 150;

export const ZoneSquare: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('objects.rectangle', { defaultValue: 'Rectangle' })}
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Rect,
                        width: DEFAULT_SIZE,
                        height: DEFAULT_SIZE,
                    },
                    offset: getDragOffset(e),
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
            variantType: 'realistic',
            ...object,
            ...position,
        },
    };
});

const RectangleRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);

    const size = Math.min(object.width, object.height);
    const isRealistic = (object.variantType ?? 'realistic') === 'realistic';
    const classicHollow = object.variantType === 'hollow';

    const style = getZoneStyle(
        object.color,
        object.opacity,
        size,
        classicHollow,
        isRealistic,
        isRealistic
            ? {
                  globalOpacity: object.globalOpacity,
                  baseColor: object.baseColor,
                  baseOpacity: object.baseOpacity,
                  innerGlowColor: object.innerGlowColor,
                  innerGlowOpacity: object.innerGlowOpacity,
                  outlineColor: object.outlineColor,
                  outlineOpacity: object.outlineOpacity,
              }
            : undefined,
    );

    const highlightOffset = style.strokeWidth;
    const highlightWidth = object.width + highlightOffset;
    const highlightHeight = object.height + highlightOffset;

    return (
        <ResizeableObjectContainer object={object} transformerProps={{ keepRatio: false }} skipClearCache>
            {(groupProps) => (
                <Group {...groupProps}>
                    {highlightProps && (
                        <Rect
                            offsetX={highlightOffset / 2}
                            offsetY={highlightOffset / 2}
                            width={highlightWidth}
                            height={highlightHeight}
                            {...highlightProps}
                        />
                    )}
                    <HideGroup>
                        <AoeRect width={object.width} height={object.height} zoneStyle={style} />
                    </HideGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<RectangleZone>(ObjectType.Rect, LayerName.Ground, RectangleRenderer);

const RectangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={t('objects.rectangle', { defaultValue: 'Rectangle' })}
            object={object}
            {...props}
        />
    );
};

registerListComponent<RectangleZone>(ObjectType.Rect, RectangleDetails);
