import { useTranslation } from 'react-i18next';
import { Circle, Group, Image } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { MechCounterTowerObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, SPOTLIGHT_COLOR } from '../../theme';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';

const prefabIcon = new URL(`board/objects/127.webp`, import.meta.env.VITE_COS_URL).href;
const getIconUrl = (count: 1 | 2 | 3 | 4) =>
    new URL(`board/objects/${count + 126}.webp`, import.meta.env.VITE_COS_URL).href;

const DEFAULT_SIZE = 40;

const RESPONSIVE_SIZE_SCALE = 0.88;

export const MechCounterTowerPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('mechanic.counterTower')}
            icon={prefabIcon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.MechCounterTower,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<MechCounterTowerObject>(ObjectType.MechCounterTower, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.MechCounterTower,
            radius: DEFAULT_SIZE,
            opacity: 100,
            rotation: 0,
            count: 1,
            countValues: [1, 2, 3, 4],
            ...object,
            ...position,
        } as MechCounterTowerObject,
    };
});

export const MechCounterTowerRenderer: React.FC<RendererProps<MechCounterTowerObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);

    const count = Math.max(Math.min(4, Math.floor(object.count)), 1) as 1 | 2 | 3 | 4;
    const [image] = useImageTracked(getIconUrl(count));

    // 调整一下显示比例，使尺寸数值更加符合视觉效果
    const responsiveSize = object.radius * RESPONSIVE_SIZE_SCALE;
    const strokeWidth = Math.max(2, Math.min(4, responsiveSize / 100));

    return (
        <RadiusObjectContainer object={object} allowRotate>
            {(groupProps) => (
                <Group {...groupProps}>
                    {highlightProps && <Circle radius={responsiveSize + strokeWidth / 2} {...highlightProps} />}
                    <HideGroup>
                        <Image
                            image={image}
                            x={-object.radius}
                            y={-object.radius}
                            width={object.radius * 2}
                            height={object.radius * 2}
                            opacity={object.opacity / 100}
                            listening={false}
                        />
                        <Circle radius={responsiveSize} opacity={0} />
                        {groupProps.isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={SPOTLIGHT_COLOR} />}
                    </HideGroup>
                </Group>
            )}
        </RadiusObjectContainer>
    );
};

registerRenderer<MechCounterTowerObject>(ObjectType.MechCounterTower, LayerName.Ground, MechCounterTowerRenderer);

export const MechCounterTowerDetails: React.FC<ListComponentProps<MechCounterTowerObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const count = Math.max(Math.min(4, Math.floor(object.count), 1)) as 1 | 2 | 3 | 4;
    const name = t(`mechanic.counterTower`);
    return <DetailsItem icon={getIconUrl(count)} name={name} object={object} {...props} />;
};

registerListComponent<MechCounterTowerObject>(ObjectType.MechCounterTower, MechCounterTowerDetails);
