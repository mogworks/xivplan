import { ImageAddRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { getProxyImageUrl } from '../lib/image-proxy';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { Asset, ObjectType } from '../scene';
import { useImageTracked } from '../useObjectLoading';
import { usePanelDrag } from '../usePanelDrag';
import { HideGroup } from './HideGroup';
import { useHighlightProps } from './highlight';
import { PrefabIcon } from './PrefabIcon';
import { ResizableObjectContainer } from './ResizableObjectContainer';

export const AssetPrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('prefabs.asset')}
            icon={<ImageAddRegular />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Asset,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<Asset>(ObjectType.Asset, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Asset,
            name: '',
            image: 'https://cos.xivstrat.cn/imgs/tmp.jpg',
            opacity: 100,
            width: 200,
            height: 200,
            rotation: 0,
            flipHorizontal: false,
            flipVertical: false,
            hNum: 1,
            vNum: 1,
            ...object,
            ...position,
        } as Asset,
    };
});

export const AssetRenderer: React.FC<RendererProps<Asset>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(getProxyImageUrl(object.image));

    const hNum = object.hNum || 1;
    const vNum = object.vNum || 1;

    return (
        <ResizableObjectContainer object={object} transformerProps={{ centeredScaling: true }}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {highlightProps && (
                        <Rect
                            x={(-object.width * (hNum - 1)) / 2}
                            y={(-object.height * (vNum - 1)) / 2}
                            width={object.width * hNum}
                            height={object.height * vNum}
                            cornerRadius={(object.width + object.height) / 10}
                            {...highlightProps}
                        />
                    )}
                    <HideGroup>
                        {Array.from({ length: hNum * vNum }).map((_, i) => (
                            <Image
                                key={i}
                                image={image}
                                width={object.width}
                                height={object.height}
                                opacity={object.opacity / 100}
                                x={object.width / 2 + (i % hNum) * object.width - ((hNum - 1) * object.width) / 2}
                                y={
                                    object.height / 2 +
                                    Math.floor(i / hNum) * object.height -
                                    ((vNum - 1) * object.height) / 2
                                }
                                offsetX={object.width / 2}
                                offsetY={object.height / 2}
                                scaleX={object.flipHorizontal ? -1 : 1}
                                scaleY={object.flipVertical ? -1 : 1}
                            />
                        ))}
                    </HideGroup>
                </Group>
            )}
        </ResizableObjectContainer>
    );
};

registerRenderer<Asset>(ObjectType.Asset, LayerName.Default, AssetRenderer);

export const AssetDetails: React.FC<ListComponentProps<Asset>> = ({ object, ...props }) => {
    const name = object.name ?? '';
    return <DetailsItem icon={getProxyImageUrl(object.image)} name={name} object={object} {...props} />;
};

registerListComponent<Asset>(ObjectType.Asset, AssetDetails);
