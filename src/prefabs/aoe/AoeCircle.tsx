import React from 'react';
import { useTranslation } from 'react-i18next';
import { Circle } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/circle.svg?react';
import AoeCircle from '../../lib/aoe/AoeCircle';
import { AoeProps } from '../../lib/aoe/aoeProps';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { AoeCircleObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_HIGHLIGHT_COLOR, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useHighlightProps } from '../highlight';
import { getAoeStyle } from './style';

const DEFAULT_RADIUS = 80;

export const AoeCirclePrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    const icon = new URL('public/prefabs/aoe/circle.webp', import.meta.env.VITE_COS_URL).href;

    return (
        <PrefabIcon
            draggable
            name={t('aoe.circle')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.AoeCircle,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<AoeCircleObject>(ObjectType.AoeCircle, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.AoeCircle,
            opacity: 100,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

interface AoeCircleRendererProps extends RendererProps<AoeCircleObject> {
    isDragging?: boolean;
    isResizing?: boolean;
}

const AoeCircleRenderer: React.FC<AoeCircleRendererProps> = ({ object, isDragging, isResizing }) => {
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
        <>
            {highlightProps && <Circle radius={object.radius + style.strokeWidth / 2} {...highlightProps} />}

            <HideGroup>
                <AoeCircle radius={object.radius} freeze={isResizing} {...aoeProps} />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </>
    );
};

const AoeCircleContainer: React.FC<RendererProps<AoeCircleObject>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {(props) => <AoeCircleRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<AoeCircleObject>(ObjectType.AoeCircle, LayerName.Ground, AoeCircleContainer);

const AoeCircleDetails: React.FC<ListComponentProps<AoeCircleObject>> = ({ object, ...props }) => {
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
            name={t('aoe.circle')}
            object={object}
            {...props}
        />
    );
};

registerListComponent<AoeCircleObject>(ObjectType.AoeCircle, AoeCircleDetails);
