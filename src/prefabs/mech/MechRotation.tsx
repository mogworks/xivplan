import { useTranslation } from 'react-i18next';
import { Circle, Group, Image } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { MechRotationObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, SPOTLIGHT_COLOR } from '../../theme';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { makeDisplayName } from '../../util';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';

const getIconUrl = (anticlockwise?: boolean) =>
    new URL(`public/board/objects/${anticlockwise ? 140 : 139}.webp`, import.meta.env.VITE_COS_URL).href;

const DEFAULT_SIZE = 40;

const RESPONSIVE_SIZE_SCALE = 0.9;

function makeIcon(anticlockwise?: boolean) {
    const nameKey = `mechanic.rotation.${anticlockwise ? 'anticlockwise' : 'clockwise'}`;
    const Component: React.FC = () => {
        const [, setDragObject] = usePanelDrag();

        const iconUrl = getIconUrl(anticlockwise);
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
                            type: ObjectType.MechRotation,
                            anticlockwise,
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

export const MechClockwiseRotationPrefab = makeIcon(false);
export const MechAnticlockwiseRotationPrefab = makeIcon(true);

registerDropHandler<MechRotationObject>(ObjectType.MechRotation, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.MechRotation,
            radius: DEFAULT_SIZE,
            opacity: 100,
            rotation: 0,
            ...object,
            ...position,
        } as MechRotationObject,
    };
});

export const MechRotationRenderer: React.FC<RendererProps<MechRotationObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(getIconUrl(object.anticlockwise));

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

registerRenderer<MechRotationObject>(ObjectType.MechRotation, LayerName.Ground, MechRotationRenderer);

export const MechRotationDetails: React.FC<ListComponentProps<MechRotationObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = t(`mechanic.rotation.${object.anticlockwise ? 'anticlockwise' : 'clockwise'}`);
    return <DetailsItem icon={getIconUrl(object.anticlockwise)} name={name} object={object} {...props} />;
};

registerListComponent<MechRotationObject>(ObjectType.MechRotation, MechRotationDetails);
