import { Vector2d } from 'konva/lib/types';
import { useTranslation } from 'react-i18next';
import { Circle, Group, Image } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { MechCircleExaflareObject, ObjectType } from '../../scene';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, SPOTLIGHT_COLOR } from '../../theme';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { useHighlightProps } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { EXAFLARE_SPACING_DEFAULT } from '../zone/constants';

const icon = new URL(`public/board/objects/126.webp`, import.meta.env.VITE_COS_URL).href;

const DEFAULT_SIZE = 50;

const RESPONSIVE_SIZE_SCALE = 0.96;

export const MechCircleExaflarePrefab: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    const { t } = useTranslation();
    return (
        <PrefabIcon
            draggable
            name={t('mechanic.circleExaflare')}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.MechCircleExaflare,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<MechCircleExaflareObject>(ObjectType.MechCircleExaflare, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.MechCircleExaflare,
            radius: DEFAULT_SIZE,
            opacity: 100,
            rotation: 0,
            length: 6,
            spacing: EXAFLARE_SPACING_DEFAULT,
            ...object,
            ...position,
        } as MechCircleExaflareObject,
    };
});

function getTrailPositions(radius: number, length: number, spacing: number): Vector2d[] {
    return Array.from({ length }).map((_, i) => ({
        x: 0,
        y: ((radius * 2 * spacing) / 100) * i,
    }));
}

function getDashSize(radius: number) {
    return (2 * Math.PI * radius) / 32;
}

export const MechCircleExaflareRenderer: React.FC<RendererProps<MechCircleExaflareObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(icon);

    // 调整一下显示比例，使尺寸数值更加符合视觉效果
    const responsiveSize = object.radius * RESPONSIVE_SIZE_SCALE;
    const strokeWidth = Math.max(2, Math.min(4, responsiveSize / 100));

    const trail = getTrailPositions(responsiveSize, object.length, object.spacing);
    const dashSize = getDashSize(responsiveSize);

    return (
        <RadiusObjectContainer object={object} allowRotate>
            {(groupProps) => (
                <Group {...groupProps}>
                    <HideGroup>
                        {trail.map((point, i) => (
                            <Circle
                                key={i}
                                listening={false}
                                radius={responsiveSize}
                                {...point}
                                stroke={DEFAULT_AOE_COLOR}
                                strokeWidth={strokeWidth}
                                fillEnabled={false}
                                dash={[dashSize, dashSize]}
                                dashOffset={dashSize / 2}
                                opacity={0.5}
                            />
                        ))}
                    </HideGroup>

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

registerRenderer<MechCircleExaflareObject>(ObjectType.MechCircleExaflare, LayerName.Ground, MechCircleExaflareRenderer);

export const MechCircleExaflareDetails: React.FC<ListComponentProps<MechCircleExaflareObject>> = ({
    object,
    ...props
}) => {
    const { t } = useTranslation();
    const name = t(`mechanic.circleExaflare`);
    return <DetailsItem icon={icon} name={name} object={object} {...props} />;
};

registerListComponent<MechCircleExaflareObject>(ObjectType.MechCircleExaflare, MechCircleExaflareDetails);
