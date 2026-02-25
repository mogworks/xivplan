import React from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Ring } from 'react-konva';
import Icon from '../../assets/zone/donut.svg?react';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import AoeDonut from '../../lib/aoe/AoeDonut';
import { AoeProps } from '../../lib/aoe/aoeProps';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { AoeDonutObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_HIGHLIGHT_COLOR, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { getAoeStyle } from './style';

const DEFAULT_OUTER_RADIUS = 120;
const DEFAULT_INNER_RADIUS = 50;

export const AoeDonutPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    const icon = new URL('prefabs/aoe/donut.webp', import.meta.env.VITE_COS_URL).href;

    return (
        <PrefabIcon
            draggable
            name={t('aoe.donut')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.AoeDonut,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<AoeDonutObject>(ObjectType.AoeDonut, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.AoeDonut,
            opacity: 100,
            innerRadius: DEFAULT_INNER_RADIUS,
            radius: DEFAULT_OUTER_RADIUS,
            ...object,
            ...position,
        },
    };
});

interface AoeDonutRendererProps extends RendererProps<AoeDonutObject> {
    isDragging?: boolean;
    isResizing?: boolean;
}

const AoeDonutRenderer: React.FC<AoeDonutRendererProps> = ({ object, isDragging, isResizing }) => {
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
        <>
            {highlightProps && (
                <Ring
                    innerRadius={highlightInnerRadius - style.strokeWidth / 2}
                    outerRadius={highlightOuterRadius + style.strokeWidth / 2}
                    {...highlightProps}
                />
            )}
            <HideGroup>
                <AoeDonut
                    innerRadius={object.innerRadius}
                    outerRadius={object.radius}
                    freeze={isResizing}
                    {...aoeProps}
                />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </>
    );
};

const AoeDonutContainer: React.FC<RendererProps<AoeDonutObject>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object} allowInnerRadius>
            {(props) => <AoeDonutRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<AoeDonutObject>(ObjectType.AoeDonut, LayerName.Ground, AoeDonutContainer);

const AoeDonutDetails: React.FC<ListComponentProps<AoeDonutObject>> = ({ object, ...props }) => {
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
            name={t('aoe.donut')}
            object={object}
            {...props}
        />
    );
};

registerListComponent<AoeDonutObject>(ObjectType.AoeDonut, AoeDonutDetails);
