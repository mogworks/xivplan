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
import { ResizeableObjectContainer } from './ResizeableObjectContainer';

const getIconUrl = (iconId: number) =>
    new URL(`public/board/objects/${iconId}.webp`, import.meta.env.VITE_COS_URL).href;

export const BoardIconRenderer: React.FC<RendererProps<BoardIconObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(getIconUrl(object.iconId));

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
                            scaleX={object.flipHorizontal ? -1 : 1}
                            scaleY={object.flipVertical ? -1 : 1}
                        />
                    </HideGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<BoardIconObject>(ObjectType.BoardIcon, LayerName.Default, BoardIconRenderer);

export const BoardIconDetails: React.FC<ListComponentProps<BoardIconObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = object.name || t(`boardIcon.${object.iconId}`, { defaultValue: object.iconId });
    return <DetailsItem icon={getIconUrl(object.iconId)} name={name} object={object} {...props} />;
};

registerListComponent<BoardIconObject>(ObjectType.BoardIcon, BoardIconDetails);
