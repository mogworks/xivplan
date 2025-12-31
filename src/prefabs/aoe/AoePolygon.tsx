import React from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Group, RegularPolygon } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import HexagonIcon from '../../assets/zone/hexagon.svg?react';
import OcatgonIcon from '../../assets/zone/octagon.svg?react';
import PentagonIcon from '../../assets/zone/pentagon.svg?react';
import SeptagonIcon from '../../assets/zone/septagon.svg?react';
import SquareIcon from '../../assets/zone/square.svg?react';
import TriangleIcon from '../../assets/zone/triangle.svg?react';
import AoePolygon from '../../lib/aoe/AoePolygon';
import { AoeProps } from '../../lib/aoe/aoeProps';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { AoePolygonObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_HIGHLIGHT_COLOR, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useHighlightProps } from '../highlight';
import { getAoeStyle } from './style';

const DEFAULT_RADIUS = 80;
const DEFAULT_SIDES = 6;

function getIconAndName(
    t: (key: string, opts?: { defaultValue?: string }) => string,
    sides: number,
): [typeof TriangleIcon, string] {
    switch (sides) {
        case 3:
            return [TriangleIcon, t('aoe.polygon.triangle')];
        case 4:
            return [SquareIcon, t('aoe.polygon.square')];
        case 5:
            return [PentagonIcon, t('aoe.polygon.pentagon')];
        case 6:
            return [HexagonIcon, t('aoe.polygon.hexagon')];
        case 7:
            return [SeptagonIcon, t('aoe.polygon.septagon')];
        case 8:
            return [OcatgonIcon, t('aoe.polygon.octagon')];
        default:
            return [OcatgonIcon, t('aoe.polygon.default')];
    }
}

export const AoePolygonPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    const icon = new URL('public/prefabs/aoe/polygon.webp', import.meta.env.VITE_COS_URL).href;

    return (
        <PrefabIcon
            draggable
            name={t('aoe.polygon.default')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.AoePolygon,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<AoePolygonObject>(ObjectType.AoePolygon, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.AoePolygon,
            opacity: 100,
            radius: DEFAULT_RADIUS,
            sides: DEFAULT_SIDES,
            orient: 'side',
            rotation: 0,
            ...object,
            ...position,
        } as AoePolygonObject,
    };
});

interface AoePolygonRendererProps extends RendererProps<AoePolygonObject> {
    isDragging?: boolean;
    isResizing?: boolean;
}

const AoePolygonRenderer: React.FC<AoePolygonRendererProps> = ({ object, isDragging, isResizing }) => {
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

    const orientRotation = object.orient === 'side' ? 180 / object.sides : 0;

    return (
        <Group rotation={object.rotation + orientRotation}>
            {highlightProps && (
                <RegularPolygon
                    radius={object.radius + style.strokeWidth / 2}
                    sides={object.sides}
                    {...style}
                    {...highlightProps}
                />
            )}
            <HideGroup>
                <AoePolygon radius={object.radius} sides={object.sides} freeze={isResizing} {...aoeProps} />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </Group>
    );
};

const AoePolygonContainer: React.FC<RendererProps<AoePolygonObject>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object} allowRotate>
            {(props) => <AoePolygonRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<AoePolygonObject>(ObjectType.AoePolygon, LayerName.Ground, AoePolygonContainer);

const AoePolygonDetails: React.FC<ListComponentProps<AoePolygonObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const [Icon, name] = getIconAndName(t, object.sides);
    return (
        <DetailsItem
            icon={
                <Icon
                    width="100%"
                    height="100%"
                    style={{ [panelVars.colorZoneOrange]: object.baseColor ?? DEFAULT_AOE_COLOR }}
                />
            }
            name={name}
            object={object}
            {...props}
        />
    );
};

registerListComponent<AoePolygonObject>(ObjectType.AoePolygon, AoePolygonDetails);
