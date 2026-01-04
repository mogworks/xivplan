import { useTranslation } from 'react-i18next';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { EnemyObject, ObjectType } from '../scene';
import { useImageTracked } from '../useObjectLoading';
import { usePanelDrag } from '../usePanelDrag';
import { makeDisplayName } from '../util';
import { HideGroup } from './HideGroup';
import { useHighlightProps } from './highlight';
import { PrefabIcon } from './PrefabIcon';
import { RegularResizableObjectContainer } from './ResizableObjectContainer';

const DEFAULT_SIZE = 60;
const getIconUrl = (iconId: number) =>
    new URL(`public/board/objects/${iconId}.webp`, import.meta.env.VITE_COS_URL).href;
const getNameKey = (iconId: number) => `enemy.${iconId}`;

function makeIcon(iconId: number) {
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
                            type: ObjectType.Enemy,
                            iconId,
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

export const EnemySmall = makeIcon(60);
export const EnemyMedium = makeIcon(62);
export const EnemyLarge = makeIcon(64);

registerDropHandler<EnemyObject>(ObjectType.Enemy, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Enemy,
            opacity: 100,
            size: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        } as EnemyObject,
    };
});

export const EnemyRenderer: React.FC<RendererProps<EnemyObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(getIconUrl(object.iconId));

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
                            width={object.size}
                            height={object.size}
                            cornerRadius={object.size / 5}
                            {...highlightProps}
                        />
                    )}
                    <HideGroup>
                        <Image
                            image={image}
                            width={object.size}
                            height={object.size}
                            opacity={object.opacity / 100}
                            x={object.size / 2}
                            y={object.size / 2}
                            offsetX={object.size / 2}
                            offsetY={object.size / 2}
                        />
                    </HideGroup>
                </Group>
            )}
        </RegularResizableObjectContainer>
    );
};

registerRenderer<EnemyObject>(ObjectType.Enemy, LayerName.Default, EnemyRenderer);

export const EnemyDetails: React.FC<ListComponentProps<EnemyObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = t(getNameKey(object.iconId));
    return <DetailsItem icon={getIconUrl(object.iconId)} name={name} object={object} {...props} />;
};

registerListComponent<EnemyObject>(ObjectType.Enemy, EnemyDetails);
