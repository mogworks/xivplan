import { useTranslation } from 'react-i18next';
import { Group, Image, Rect } from 'react-konva';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { BoardIconObject, ObjectType } from '../scene';
import { useImageTracked } from '../useObjectLoading';
import { HideGroup } from './HideGroup';
import { useHighlightProps } from './highlight';
import { RegularResizableObjectContainer } from './ResizableObjectContainer';

const getIconUrl = (iconId: number) =>
    new URL(`public/board/objects/${iconId}.webp`, import.meta.env.VITE_COS_URL).href;

export const BoardIconRenderer: React.FC<RendererProps<BoardIconObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(getIconUrl(object.iconId));

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
                                scaleX={object.flipHorizontal ? -1 : 1}
                                scaleY={object.flipVertical ? -1 : 1}
                            />
                        ))}
                    </HideGroup>
                </Group>
            )}
        </RegularResizableObjectContainer>
    );
};

registerRenderer<BoardIconObject>(ObjectType.BoardIcon, LayerName.Default, BoardIconRenderer);

export const BoardIconDetails: React.FC<ListComponentProps<BoardIconObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = object.name || t(`boardIcon.${object.iconId}`, { defaultValue: object.iconId });
    return <DetailsItem icon={getIconUrl(object.iconId)} name={name} object={object} {...props} />;
};

registerListComponent<BoardIconObject>(ObjectType.BoardIcon, BoardIconDetails);
