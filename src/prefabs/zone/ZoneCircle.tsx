import React from 'react';
import { useTranslation } from 'react-i18next';
import { Circle } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/circle.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { CircleZone, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_SHAPE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useHighlightProps } from '../highlight';
import { getZoneStyle } from './style';

const DEFAULT_RADIUS = 80;

export const ZoneCircle: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();

    return (
        <PrefabIcon
            draggable
            name={t('objects.circle', { defaultValue: 'Circle' })}
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Circle,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<CircleZone>(ObjectType.Circle, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Circle,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_SHAPE_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

interface CircleRendererProps extends RendererProps<CircleZone> {
    isDragging?: boolean;
}

const CircleRenderer: React.FC<CircleRendererProps> = ({ object, isDragging }) => {
    const highlightProps = useHighlightProps(object);

    const style = getZoneStyle(object.color, object.opacity, object.radius * 2, object.hollow);

    return (
        <>
            {highlightProps && <Circle radius={object.radius + style.strokeWidth / 2} {...highlightProps} />}

            <HideGroup>
                <Circle radius={object.radius} {...style} />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </>
    );
};

const CircleContainer: React.FC<RendererProps<CircleZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {(props) => <CircleRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<CircleZone>(ObjectType.Circle, LayerName.Ground, CircleContainer);

const CircleDetails: React.FC<ListComponentProps<CircleZone>> = ({ object, ...props }) => {
    const { t } = useTranslation();

    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: DEFAULT_AOE_COLOR }} />}
            name={t('objects.circle', { defaultValue: 'Circle' })}
            object={object}
            {...props}
        />
    );
};

registerListComponent<CircleZone>(ObjectType.Circle, CircleDetails);
