import { useTranslation } from 'react-i18next';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { IndicatorMarkerObject, ObjectType } from '../../scene';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { makeDisplayName } from '../../util';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RegularResizableObjectContainer } from '../ResizableObjectContainer';

const DEFAULT_SIZE = 36;
const getIconUrl = (iconId: number) => new URL(`board/objects/${iconId}.webp`, import.meta.env.VITE_COS_URL).href;
const getNameKey = (iconId: number) => `indicator.marker.${iconId}`;

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
                            type: ObjectType.IndicatorMarker,
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

export const MarkerTargetingRedPrefab = makeIcon(131);
export const MarkerTargetingBluePrefab = makeIcon(132);
export const MarkerTargetingPurplePrefab = makeIcon(133);
export const MarkerTargetingGreenPrefab = makeIcon(134);
export const MarkerHighlightCirclePrefab = makeIcon(135);
export const MarkerHighlightCrossPrefab = makeIcon(136);
export const MarkerHighlightSquarePrefab = makeIcon(137);
export const MarkerHighlightTrianglePrefab = makeIcon(138);

export const MarkerAttack1Prefab = makeIcon(65);
export const MarkerAttack2Prefab = makeIcon(66);
export const MarkerAttack3Prefab = makeIcon(67);
export const MarkerAttack4Prefab = makeIcon(68);
export const MarkerAttack5Prefab = makeIcon(69);
export const MarkerAttack6Prefab = makeIcon(115);
export const MarkerAttack7Prefab = makeIcon(116);
export const MarkerAttack8Prefab = makeIcon(117);
export const MarkerBind1Prefab = makeIcon(70);
export const MarkerBind2Prefab = makeIcon(71);
export const MarkerBind3Prefab = makeIcon(72);
export const MarkerIgnore1Prefab = makeIcon(73);
export const MarkerIgnore2Prefab = makeIcon(74);
export const MarkerSquarePrefab = makeIcon(75);
export const MarkerCirclePrefab = makeIcon(76);
export const MarkerCrossPrefab = makeIcon(77);
export const MarkerTrianglePrefab = makeIcon(78);

registerDropHandler<IndicatorMarkerObject>(ObjectType.IndicatorMarker, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.IndicatorMarker,
            opacity: 100,
            size: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        } as IndicatorMarkerObject,
    };
});

export const IndicatorMarkerRenderer: React.FC<RendererProps<IndicatorMarkerObject>> = ({ object }) => {
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

registerRenderer<IndicatorMarkerObject>(ObjectType.IndicatorMarker, LayerName.Foreground, IndicatorMarkerRenderer);

export const IndicatorMarkerDetails: React.FC<ListComponentProps<IndicatorMarkerObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = t(getNameKey(object.iconId));
    return <DetailsItem icon={getIconUrl(object.iconId)} name={name} object={object} {...props} />;
};

registerListComponent<IndicatorMarkerObject>(ObjectType.IndicatorMarker, IndicatorMarkerDetails);
