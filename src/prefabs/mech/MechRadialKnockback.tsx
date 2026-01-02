import { useTranslation } from 'react-i18next';
import { Circle, Group, Image } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { MechRadialKnockbackObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, SPOTLIGHT_COLOR } from '../../theme';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';

const icon = new URL(`public/board/objects/109.webp`, import.meta.env.VITE_COS_URL).href;

const DEFAULT_SIZE = 160;

const RESPONSIVE_SIZE_SCALE = 0.96;

export const MechRadialKnockbackPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('mechanic.radialKnockback')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.MechRadialKnockback,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<MechRadialKnockbackObject>(ObjectType.MechRadialKnockback, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.MechRadialKnockback,
            radius: DEFAULT_SIZE,
            opacity: 100,
            rotation: 0,
            ...object,
            ...position,
        } as MechRadialKnockbackObject,
    };
});

export const MechRadialKnockbackRenderer: React.FC<RendererProps<MechRadialKnockbackObject>> = ({ object }) => {
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

registerRenderer<MechRadialKnockbackObject>(
    ObjectType.MechRadialKnockback,
    LayerName.Ground,
    MechRadialKnockbackRenderer,
);

export const MechRadialKnockbackDetails: React.FC<ListComponentProps<MechRadialKnockbackObject>> = ({
    object,
    ...props
}) => {
    const { t } = useTranslation();
    const name = t(`mechanic.radialKnockback`);
    return <DetailsItem icon={icon} name={name} object={object} {...props} />;
};

registerListComponent<MechRadialKnockbackObject>(ObjectType.MechRadialKnockback, MechRadialKnockbackDetails);
