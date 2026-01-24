import { useTranslation } from 'react-i18next';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { BoardIconObject, ObjectType } from '../scene';
import { useImageTracked } from '../useObjectLoading';
import { usePanelDrag } from '../usePanelDrag';
import { makeDisplayName } from '../util';
import { HideGroup } from './HideGroup';
import { useHighlightProps } from './highlight';
import { PrefabIcon } from './PrefabIcon';
import { RegularResizableObjectContainer } from './ResizableObjectContainer';

const getIconUrl = (iconId: number) =>
    new URL(`public/board/objects/${iconId}.webp`, import.meta.env.VITE_COS_URL).href;

const getNameKey = (iconId: number) => `boardIcon.${iconId}`;

function makeIcon(iconId: number, extra?: Record<string, unknown>) {
    const nameKey = getNameKey(iconId);
    const Component: React.FC = () => {
        const [, setDragObject] = usePanelDrag();

        const iconUrl = getIconUrl(iconId);
        const { t } = useTranslation();
        const label = t(nameKey);

        return (
            <PrefabIcon
                draggable
                name={label}
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.BoardIcon,
                            iconId,
                            ...extra,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
    Component.displayName = makeDisplayName(nameKey);
    return Component;
}

export const BoardIconCirclePrefab = makeIcon(87);
export const BoardIconCrossPrefab = makeIcon(88);
export const BoardIconTrianglePrefab = makeIcon(89, { flipVertical: false });
export const BoardIconSquarePrefab = makeIcon(90);
export const BoardIconArrowPrefab = makeIcon(94, { flipVertical: false });
export const BoardIconRotationPrefab = makeIcon(103, { flipHorizontal: false, flipVertical: false });

export const BoardIconCircleGridBottomPrefab = makeIcon(4, { size: 320 });
export const BoardIconSquareGridBottomPrefab = makeIcon(8, { size: 320 });
export const BoardIconCircleGrayBottomPrefab = makeIcon(124, { size: 320 });
export const BoardIconSquareGrayBottomPrefab = makeIcon(125, { size: 320 });

export const BoardIconBuffPrefab = makeIcon(113, { size: 40 });
export const BoardIconDebuffPrefab = makeIcon(114, { size: 40 });

registerDropHandler<BoardIconObject>(ObjectType.BoardIcon, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.BoardIcon,
            opacity: 100,
            size: 60,
            rotation: 0,
            ...object,
            ...position,
        } as BoardIconObject,
    };
});

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
    const name = object.name || t(getNameKey(object.iconId), { defaultValue: object.iconId });
    return <DetailsItem icon={getIconUrl(object.iconId)} name={name} object={object} {...props} />;
};

registerListComponent<BoardIconObject>(ObjectType.BoardIcon, BoardIconDetails);
