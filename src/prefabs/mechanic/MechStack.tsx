import { useTranslation } from 'react-i18next';
import { Circle, Group, Image } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { MechStackObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, SPOTLIGHT_COLOR } from '../../theme';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';

const prefabIcon = new URL(`public/board/objects/14.webp`, import.meta.env.VITE_COS_URL).href;
const getIconUrl = (multiHit?: boolean) =>
    new URL(`public/board/objects/${multiHit ? 106 : 14}.webp`, import.meta.env.VITE_COS_URL).href;

const DEFAULT_SIZE = 60;

const RESPONSIVE_SIZE_SCALE = 1;

export const MechStackPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('mechanic.stack.normal')}
            icon={prefabIcon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.MechStack,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<MechStackObject>(ObjectType.MechStack, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.MechStack,
            radius: DEFAULT_SIZE,
            rotation: 0,
            opacity: 100,
            ...object,
            ...position,
        } as MechStackObject,
    };
});

export const MechStackRenderer: React.FC<RendererProps<MechStackObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(getIconUrl(object.multiHit));

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

registerRenderer<MechStackObject>(ObjectType.MechStack, LayerName.Ground, MechStackRenderer);

export const MechStackDetails: React.FC<ListComponentProps<MechStackObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = t(`mechanic.stack.${object.multiHit ? 'multiHit' : 'normal'}`);
    return <DetailsItem icon={getIconUrl(object.multiHit)} name={name} object={object} {...props} />;
};

registerListComponent<MechStackObject>(ObjectType.MechStack, MechStackDetails);
