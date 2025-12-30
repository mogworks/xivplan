import { useTranslation } from 'react-i18next';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { MechStackObject, ObjectType } from '../../scene';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';

const icon = new URL(`public/board/objects/14.webp`, import.meta.env.VITE_COS_URL).href;
const DEFAULT_SIZE = 100;

export const MechStackPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('mechanic.stack')}
            icon={icon}
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
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            opacity: 100,
            ...object,
            ...position,
        } as MechStackObject,
    };
});

export const MechStackRenderer: React.FC<RendererProps<MechStackObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(icon);

    return (
        <ResizeableObjectContainer object={object} transformerProps={{ centeredScaling: true }}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {highlightProps && (
                        <Rect
                            width={object.width}
                            height={object.height}
                            cornerRadius={(object.width + object.height) / 2 / 5}
                            {...highlightProps}
                        />
                    )}
                    <HideGroup>
                        <Image
                            image={image}
                            width={object.width}
                            height={object.height}
                            opacity={object.opacity / 100}
                        />
                    </HideGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<MechStackObject>(ObjectType.MechStack, LayerName.Default, MechStackRenderer);

export const MechStackDetails: React.FC<ListComponentProps<MechStackObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = t(`mechanic.stack`);
    return <DetailsItem icon={icon} name={name} object={object} {...props} />;
};

registerListComponent<MechStackObject>(ObjectType.MechStack, MechStackDetails);
