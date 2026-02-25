import { useTranslation } from 'react-i18next';
import { Circle, Group, Image } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { IndicatorProximityObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, SPOTLIGHT_COLOR } from '../../theme';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';

const icon = new URL(`board/objects/107.webp`, import.meta.env.VITE_COS_URL).href;

const DEFAULT_SIZE = 40;

const RESPONSIVE_SIZE_SCALE = 0.9;

export const IndicatorProximityPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('indicator.proximity')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.IndicatorProximity,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<IndicatorProximityObject>(ObjectType.IndicatorProximity, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.IndicatorProximity,
            radius: DEFAULT_SIZE,
            opacity: 100,
            rotation: 0,
            ...object,
            ...position,
        } as IndicatorProximityObject,
    };
});

export const IndicatorProximityRenderer: React.FC<RendererProps<IndicatorProximityObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(icon);

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

registerRenderer<IndicatorProximityObject>(ObjectType.IndicatorProximity, LayerName.Ground, IndicatorProximityRenderer);

export const IndicatorProximityDetails: React.FC<ListComponentProps<IndicatorProximityObject>> = ({
    object,
    ...props
}) => {
    const { t } = useTranslation();
    const name = t(`indicator.proximity`);
    return <DetailsItem icon={icon} name={name} object={object} {...props} />;
};

registerListComponent<IndicatorProximityObject>(ObjectType.IndicatorProximity, IndicatorProximityDetails);
