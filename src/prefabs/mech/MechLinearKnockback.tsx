import { useTranslation } from 'react-i18next';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { MechLinearKnockbackObject, ObjectType } from '../../scene';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RegularResizableObjectContainer } from '../ResizableObjectContainer';

const DEFAULT_SIZE = 320;
const icon = new URL(`board/objects/110.webp`, import.meta.env.VITE_COS_URL).href;

export const MechLinearKnockbackPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('mechanic.linearKnockback')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.MechLinearKnockback,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<MechLinearKnockbackObject>(ObjectType.MechLinearKnockback, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.MechLinearKnockback,
            opacity: 100,
            size: DEFAULT_SIZE,
            hNum: 1,
            vNum: 1,
            rotation: 0,
            ...object,
            ...position,
        } as MechLinearKnockbackObject,
    };
});

export const MechLinearKnockbackRenderer: React.FC<RendererProps<MechLinearKnockbackObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(icon);

    const hNum = object.hNum || 1;
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

registerRenderer<MechLinearKnockbackObject>(
    ObjectType.MechLinearKnockback,
    LayerName.Ground,
    MechLinearKnockbackRenderer,
);

export const MechLinearKnockbackDetails: React.FC<ListComponentProps<MechLinearKnockbackObject>> = ({
    object,
    ...props
}) => {
    const { t } = useTranslation();
    const name = t(`mechanic.linearKnockback`);
    return <DetailsItem icon={icon} name={name} object={object} {...props} />;
};

registerListComponent<MechLinearKnockbackObject>(ObjectType.MechLinearKnockback, MechLinearKnockbackDetails);
