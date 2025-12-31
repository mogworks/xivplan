import { ShapeConfig } from 'konva/lib/Shape';
import { CircleConfig } from 'konva/lib/shapes/Circle';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Group, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/starburst.svg?react';
import AoeRect from '../../lib/aoe/AoeRect';
import { AoeProps } from '../../lib/aoe/aoeProps';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { AoeStarburstObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_HIGHLIGHT_COLOR, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { MIN_STARBURST_SPOKE_WIDTH } from '../bounds';
import { useHighlightProps } from '../highlight';
import { StarburstControlContainer } from '../zone/StarburstContainer';
import { getAoeStyle } from './style';

const DEFAULT_RADIUS = 200;
const DEFAULT_SPOKE_WIDTH = 50;
const DEFAULT_SPOKE_COUNT = 8;

export const AoeStarburstPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    const icon = new URL('public/prefabs/aoe/starburst.webp', import.meta.env.VITE_COS_URL).href;

    return (
        <PrefabIcon
            draggable
            name={t('aoe.starburst')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.AoeStarburst,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<AoeStarburstObject>(ObjectType.AoeStarburst, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.AoeStarburst,
            opacity: 100,
            radius: DEFAULT_RADIUS,
            spokes: DEFAULT_SPOKE_COUNT,
            spokeWidth: DEFAULT_SPOKE_WIDTH,
            rotation: 0,
            ...object,
            ...position,
        } as AoeStarburstObject,
    };
});

interface StarburstConfig extends CircleConfig {
    radius: number;
    spokes: number;
    spokeWidth: number;
    highlightProps?: ShapeConfig;
    freeze?: boolean;
    aoeProps: AoeProps;
}

function getOddRotations(spokes: number) {
    return Array.from({ length: spokes }).map((_, i) => 180 + (i / spokes) * 360);
}

const StarburstOdd: React.FC<StarburstConfig> = ({
    rotation,
    radius,
    spokes,
    spokeWidth,
    highlightProps,
    freeze,
    aoeProps,
    ...props
}) => {
    const items = getOddRotations(spokes);

    const rect = {
        offsetX: spokeWidth / 2,
        width: spokeWidth,
        height: radius,
        ...props,
    };

    const strokeWidth = props.strokeWidth ?? 0;
    const highlightWidth = rect.width + strokeWidth;
    const highlightHeight = rect.height + strokeWidth;

    return (
        <Group rotation={rotation}>
            {highlightProps &&
                items.map((r, i) => (
                    <Rect
                        key={i}
                        rotation={r}
                        offsetX={highlightWidth / 2}
                        width={highlightWidth}
                        height={highlightHeight}
                        {...highlightProps}
                    />
                ))}

            <HideGroup>
                {items.map((r, i) => (
                    <AoeRect key={i} rotation={r} {...rect} freeze={freeze} {...aoeProps} />
                ))}
            </HideGroup>
        </Group>
    );
};

function getEvenRotations(spokes: number) {
    const items = spokes / 2;
    return Array.from({ length: items }).map((_, i) => (i / items) * 180);
}

const StarburstEven: React.FC<StarburstConfig> = ({
    rotation,
    radius,
    spokes,
    spokeWidth,
    highlightProps,
    freeze,
    aoeProps,
    ...props
}) => {
    const items = getEvenRotations(spokes);

    const rect = {
        offsetX: spokeWidth / 2,
        offsetY: radius,
        width: spokeWidth,
        height: radius * 2,
        ...props,
    };

    const strokeWidth = props.strokeWidth ?? 0;
    const highlightWidth = rect.width + strokeWidth;
    const highlightHeight = rect.height + strokeWidth;

    return (
        <Group rotation={rotation}>
            {highlightProps &&
                items.map((r, i) => (
                    <Rect
                        key={i}
                        rotation={r}
                        offsetX={highlightWidth / 2}
                        offsetY={highlightHeight / 2}
                        width={highlightWidth}
                        height={highlightHeight}
                        {...highlightProps}
                    />
                ))}

            <HideGroup>
                {items.map((r, i) => (
                    <AoeRect key={i} rotation={r} {...rect} freeze={freeze} {...aoeProps} />
                ))}
            </HideGroup>
        </Group>
    );
};

interface AoeStarburstRendererProps extends RendererProps<AoeStarburstObject> {
    isDragging?: boolean;
    isResizing?: boolean;
}

const AoeStarburstRenderer: React.FC<AoeStarburstRendererProps> = ({ object, isDragging, isResizing }) => {
    const highlightProps = useHighlightProps(object);

    const style = getAoeStyle(DEFAULT_AOE_HIGHLIGHT_COLOR, object.opacity, object.spokeWidth * 2);
    const aoeProps = {
        opacity: object.opacity,
        baseColor: object.baseColor,
        baseOpacity: object.baseOpacity,
        innerGlowColor: object.innerGlowColor,
        innerGlowOpacity: object.innerGlowOpacity,
        outlineColor: object.outlineColor,
        outlineOpacity: object.outlineOpacity,
    } as AoeProps;

    const config: StarburstConfig = {
        freeze: isResizing,
        aoeProps,
        ...style,
        radius: object.radius,
        rotation: object.rotation,
        spokeWidth: object.spokeWidth,
        spokes: object.spokes,
        highlightProps,
    };

    return (
        <Group>
            {object.spokes % 2 === 0 ? <StarburstEven {...config} /> : <StarburstOdd {...config} />}

            {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
        </Group>
    );
};

const AoeStarburstContainer: React.FC<RendererProps<AoeStarburstObject>> = ({ object }) => {
    return (
        <StarburstControlContainer object={object} minSpokeWidth={MIN_STARBURST_SPOKE_WIDTH}>
            {(props) => <AoeStarburstRenderer object={object} {...props} />}
        </StarburstControlContainer>
    );
};

registerRenderer<AoeStarburstObject>(ObjectType.AoeStarburst, LayerName.Ground, AoeStarburstContainer);

const AoeStarburstDetails: React.FC<ListComponentProps<AoeStarburstObject>> = ({ object, ...props }) => {
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
            name={t('aoe.starburst')}
            object={object}
            {...props}
        />
    );
};

registerListComponent<AoeStarburstObject>(ObjectType.AoeStarburst, AoeStarburstDetails);
