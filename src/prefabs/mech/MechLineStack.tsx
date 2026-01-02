import { useTranslation } from 'react-i18next';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { MechLineStackObject, ObjectType } from '../../scene';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RegularResizableObjectContainer } from '../ResizableObjectContainer';

const DEFAULT_SIZE = 80;
const icon = new URL(`public/board/objects/15.webp`, import.meta.env.VITE_COS_URL).href;

export const MechLineStackPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('mechanic.stack.line')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.MechLineStack,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<MechLineStackObject>(ObjectType.MechLineStack, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.MechLineStack,
            opacity: 100,
            size: DEFAULT_SIZE,
            vNum: 1,
            rotation: 0,
            ...object,
            ...position,
        } as MechLineStackObject,
    };
});

export const MechLineStackRenderer: React.FC<RendererProps<MechLineStackObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(icon);

    const hNum = 1;
    const vNum = object.vNum || 1;

    return (
        <RegularResizableObjectContainer
            object={object}
            transformerProps={{
                centeredScaling: true,
                enabledAnchors: ['top-left', 'top-right', 'bottom-right', 'bottom-left'],
            }}
        >
            {(groupProps) => (
                <Group {...groupProps}>
                    {highlightProps && (
                        <Rect
                            x={(-object.size * (hNum - 1)) / 2}
                            y={(-object.size * (vNum - 1)) / 2}
                            width={object.size * hNum}
                            height={object.size * vNum}
                            cornerRadius={object.size / 5}
                            {...highlightProps}
                        />
                    )}
                    <HideGroup>
                        {Array.from({ length: hNum * vNum }).map((_, i) => (
                            <Image
                                key={i}
                                image={image}
                                width={object.size}
                                height={object.size}
                                opacity={object.opacity / 100}
                                x={object.size / 2 + (i % hNum) * object.size - ((hNum - 1) * object.size) / 2}
                                y={
                                    object.size / 2 +
                                    Math.floor(i / hNum) * object.size -
                                    ((vNum - 1) * object.size) / 2
                                }
                                offsetX={object.size / 2}
                                offsetY={object.size / 2}
                            />
                        ))}
                    </HideGroup>
                </Group>
            )}
        </RegularResizableObjectContainer>
    );
};

registerRenderer<MechLineStackObject>(ObjectType.MechLineStack, LayerName.Ground, MechLineStackRenderer);

export const MechLineStackDetails: React.FC<ListComponentProps<MechLineStackObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = t(`mechanic.stack.line`);
    return <DetailsItem icon={icon} name={name} object={object} {...props} />;
};

registerListComponent<MechLineStackObject>(ObjectType.MechLineStack, MechLineStackDetails);
