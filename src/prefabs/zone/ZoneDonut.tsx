import React from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Ring } from 'react-konva';
import Icon from '../../assets/zone/donut.svg?react';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import AoeRing from '../../lib/aoe/AoeRing';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { DonutZone, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { getZoneStyle } from './style';

const DEFAULT_OUTER_RADIUS = 150;
const DEFAULT_INNER_RADIUS = 50;

export const ZoneDonut: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();

    return (
        <PrefabIcon
            draggable
            name={t('objects.donut', { defaultValue: 'Donut' })}
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Donut,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<DonutZone>(ObjectType.Donut, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Donut,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            innerRadius: DEFAULT_INNER_RADIUS,
            radius: DEFAULT_OUTER_RADIUS,
            native: true,
            ...object,
            ...position,
        },
    };
});

interface DonutRendererProps extends RendererProps<DonutZone> {
    radius: number;
    innerRadius: number;
    isDragging?: boolean;
    isResizing?: boolean;
}

const DonutRenderer: React.FC<DonutRendererProps> = ({ object, radius, innerRadius, isDragging, isResizing }) => {
    const highlightProps = useHighlightProps(object);

    const isNative = object.native ?? true;
    const isHollow = !isNative && (object.hollow ?? false);

    const style = getZoneStyle(object.color, object.opacity, radius * 2, isHollow);
    const nativeStyle = {
        globalOpacity: object.globalOpacity,
        baseColor: object.baseColor,
        baseOpacity: object.baseOpacity,
        innerGlowColor: object.innerGlowColor,
        innerGlowOpacity: object.innerGlowOpacity,
        outlineColor: object.outlineColor,
        outlineOpacity: object.outlineOpacity,
    };

    const highlightInnerRadius = Math.min(radius, innerRadius);
    const highlightOuterRadius = Math.max(radius, innerRadius);

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
                {isNative ? (
                    <AoeRing innerRadius={innerRadius} outerRadius={radius} freeze={isResizing} {...nativeStyle} />
                ) : (
                    <Ring innerRadius={innerRadius} outerRadius={radius} {...style} />
                )}

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </>
    );
};

const DonutContainer: React.FC<RendererProps<DonutZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object} allowInnerRadius>
            {(props) => <DonutRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<DonutZone>(ObjectType.Donut, LayerName.Ground, DonutContainer);

const DonutDetails: React.FC<ListComponentProps<DonutZone>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    // 缩略图颜色：
    // - 朴素样式使用 object.color
    // - 原生样式使用 object.baseColor（若未设置则回退到 DEFAULT_AOE_COLOR）
    const isNative = object.native ?? true;
    const displayColor = isNative ? (object.baseColor ?? DEFAULT_AOE_COLOR) : object.color;
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: displayColor }} />}
            name={t('objects.donut', { defaultValue: 'Donut' })}
            object={object}
            {...props}
        />
    );
};

registerListComponent<DonutZone>(ObjectType.Donut, DonutDetails);
