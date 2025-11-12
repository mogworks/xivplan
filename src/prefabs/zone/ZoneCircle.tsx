import React from 'react';
import { useTranslation } from 'react-i18next';
import { Circle } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/circle.svg?react';
import AoeCircle from '../../lib/aoe/AoeCircle';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { CircleZone, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useHighlightProps } from '../highlight';
import { getZoneStyle } from './style';

const DEFAULT_RADIUS = 50;

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
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            native: true,
            ...object,
            ...position,
        },
    };
});

interface CircleRendererProps extends RendererProps<CircleZone> {
    radius: number;
    isDragging?: boolean;
    isResizing?: boolean;
}

const CircleRenderer: React.FC<CircleRendererProps> = ({ object, radius, isDragging, isResizing }) => {
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

    return (
        <>
            {highlightProps && <Circle radius={radius + style.strokeWidth / 2} {...highlightProps} />}

            <HideGroup>
                {isNative ? (
                    <AoeCircle radius={radius} freeze={isResizing} {...nativeStyle} />
                ) : (
                    <Circle radius={radius} {...style} />
                )}

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
    // 缩略图颜色：
    // - 朴素样式使用 object.color
    // - 原生样式使用 object.baseColor（若未设置则回退到 DEFAULT_AOE_COLOR）
    const isNative = object.native ?? true;
    const displayColor = isNative ? (object.baseColor ?? DEFAULT_AOE_COLOR) : object.color;
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: displayColor }} />}
            name={t('objects.circle', { defaultValue: 'Circle' })}
            object={object}
            {...props}
        />
    );
};

registerListComponent<CircleZone>(ObjectType.Circle, CircleDetails);
