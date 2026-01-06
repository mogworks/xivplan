import { useTranslation } from 'react-i18next';
import { Circle, Group } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { ObjectType, WaymarkGroupObject } from '../scene';
import { CENTER_DOT_RADIUS, SPOTLIGHT_COLOR } from '../theme';
import { usePanelDrag } from '../usePanelDrag';
import { HideGroup } from './HideGroup';
import { useHighlightProps } from './highlight';
import { PrefabIcon } from './PrefabIcon';
import { RadiusObjectContainer } from './RadiusObjectContainer';
import { WaymarkComponent } from './Waymark';
import { getWaymarkShape, WaymarkOrderType, WaymarkPlacementType, WaymarkType } from './waymarkIcon';

const icon = new URL(`public/prefabs/waymark/group.webp`, import.meta.env.VITE_COS_URL).href;

const DEFAULT_SIZE = 31;

const DEFAULT_RADIUS = 150;

export const WaymarkGroupPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('properties.waymarkGroup.name')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.WaymarkGroup,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<WaymarkGroupObject>(ObjectType.WaymarkGroup, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.WaymarkGroup,
            orderType: WaymarkOrderType.A2B3,
            placementType: WaymarkPlacementType.Circle,
            radius: DEFAULT_RADIUS,
            size: DEFAULT_SIZE,
            fgOpacity: 100,
            fgRotation: 0,
            bgOpacity: 100,
            opacity: 100,
            rotation: 0,
            ...object,
            ...position,
        } as WaymarkGroupObject,
    };
});

export const WaymarkGroupRenderer: React.FC<RendererProps<WaymarkGroupObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);

    const strokeWidth = Math.max(2, Math.min(4, object.radius / 100));

    const r = object.radius;
    const c = (Math.SQRT2 / 2) * object.radius;

    const waymarks = [
        {
            type: WaymarkType.A,
            x: 0,
            y: -r,
        },
        {
            type: WaymarkType.B,
            x: r,
            y: 0,
        },
        {
            type: WaymarkType.C,
            x: 0,
            y: r,
        },
        {
            type: WaymarkType.D,
            x: -r,
            y: 0,
        },
        {
            type: WaymarkType.One,
            x:
                object.placementType === WaymarkPlacementType.Circle
                    ? object.orderType === WaymarkOrderType.A2B3
                        ? -c
                        : c
                    : object.orderType === WaymarkOrderType.A2B3
                      ? -r
                      : r,
            y: object.placementType === WaymarkPlacementType.Circle ? -c : -r,
        },
        {
            type: WaymarkType.Two,
            x: object.placementType === WaymarkPlacementType.Circle ? c : r,
            y:
                object.placementType === WaymarkPlacementType.Circle
                    ? object.orderType === WaymarkOrderType.A2B3
                        ? -c
                        : c
                    : object.orderType === WaymarkOrderType.A2B3
                      ? -r
                      : r,
        },
        {
            type: WaymarkType.Three,
            x:
                object.placementType === WaymarkPlacementType.Circle
                    ? object.orderType === WaymarkOrderType.A2B3
                        ? c
                        : -c
                    : object.orderType === WaymarkOrderType.A2B3
                      ? r
                      : -r,
            y: object.placementType === WaymarkPlacementType.Circle ? c : r,
        },
        {
            type: WaymarkType.Four,
            x: object.placementType === WaymarkPlacementType.Circle ? -c : -r,
            y:
                object.placementType === WaymarkPlacementType.Circle
                    ? object.orderType === WaymarkOrderType.A2B3
                        ? c
                        : -c
                    : object.orderType === WaymarkOrderType.A2B3
                      ? r
                      : -r,
        },
    ];

    return (
        <RadiusObjectContainer object={object} allowRotate>
            {(groupProps) => (
                <Group {...groupProps}>
                    {highlightProps && <Circle radius={object.radius + strokeWidth / 2} {...highlightProps} />}
                    <HideGroup>
                        {waymarks.map((waymark) => (
                            <Group
                                key={waymark.type}
                                x={waymark.x}
                                y={waymark.y}
                                offsetX={object.size / 2}
                                offsetY={object.size / 2}
                            >
                                <WaymarkComponent
                                    type={waymark.type}
                                    shape={getWaymarkShape(waymark.type)}
                                    size={object.size}
                                    bgOpacity={object.bgOpacity}
                                    fgOpacity={object.fgOpacity}
                                    fgRotation={object.fgRotation}
                                />
                            </Group>
                        ))}
                        {groupProps.isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={SPOTLIGHT_COLOR} />}
                    </HideGroup>
                </Group>
            )}
        </RadiusObjectContainer>
    );
};

registerRenderer<WaymarkGroupObject>(ObjectType.WaymarkGroup, LayerName.Ground, WaymarkGroupRenderer);

export const WaymarkGroupDetails: React.FC<ListComponentProps<WaymarkGroupObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = t(`properties.waymarkGroup.name`);
    return <DetailsItem icon={icon} name={name} object={object} {...props} />;
};

registerListComponent<WaymarkGroupObject>(ObjectType.WaymarkGroup, WaymarkGroupDetails);
