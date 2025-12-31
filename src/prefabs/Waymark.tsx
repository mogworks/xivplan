import { ShapeConfig } from 'konva/lib/Shape';
import { useTranslation } from 'react-i18next';
import { Ellipse, Group, Image, Rect } from 'react-konva';
import { ALIGN_TO_PIXEL } from '../coord';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { ObjectType, WaymarkObject } from '../scene';
import { useImageTracked } from '../useObjectLoading';
import { usePanelDrag } from '../usePanelDrag';
import { makeDisplayName } from '../util';
import { HideGroup } from './HideGroup';
import { useHighlightProps } from './highlight';
import { PrefabIcon } from './PrefabIcon';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';
import { getWaymarkIconUrl, getWaymarkShape, WaymarkShape, WaymarkType } from './waymarkIcon';

const DEFAULT_SIZE = 32;

function makeIcon(type: WaymarkType) {
    const Component: React.FC = () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = getWaymarkIconUrl(type);

        return (
            <PrefabIcon
                draggable
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.Waymark,
                            waymarkType: type,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
    Component.displayName = makeDisplayName(`boardIcon.waymark.${type}`);
    return Component;
}

registerDropHandler<WaymarkObject>(ObjectType.Waymark, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Waymark,
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            opacity: 100,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

interface OutlineProps {
    width: number;
    height: number;
    highlightWidth: number;
    highlightHeight: number;
    highlightOffset: number;
    highlightProps?: ShapeConfig;
}

const EllipseOutline: React.FC<OutlineProps> = ({ width, height, highlightWidth, highlightHeight, highlightProps }) => {
    return (
        <>
            {highlightProps && (
                <Ellipse
                    x={width / 2}
                    y={height / 2}
                    radiusX={highlightWidth / 2}
                    radiusY={highlightHeight / 2}
                    {...highlightProps}
                />
            )}
        </>
    );
};

const RectangleOutline: React.FC<OutlineProps> = ({
    highlightWidth,
    highlightHeight,
    highlightOffset,
    highlightProps,
}) => {
    return (
        <>
            {highlightProps && (
                <Rect
                    x={-highlightOffset / 2}
                    y={-highlightOffset / 2}
                    width={highlightWidth}
                    height={highlightHeight}
                    {...highlightProps}
                    {...ALIGN_TO_PIXEL}
                />
            )}
        </>
    );
};

export const WaymarkRenderer: React.FC<RendererProps<WaymarkObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [fgImage] = useImageTracked(getWaymarkIconUrl(object.waymarkType, false));
    const [bgImage] = useImageTracked(getWaymarkIconUrl(object.waymarkType, true));

    const strokeWidth = 1;

    const highlightOffset = strokeWidth * 4;
    const highlightWidth = object.width + highlightOffset;
    const highlightHeight = object.height + highlightOffset;

    return (
        <ResizeableObjectContainer
            object={object}
            transformerProps={{ centeredScaling: true, padding: -Math.min(object.width * 0.3, object.height * 0.3) }}
        >
            {(groupProps) => (
                <Group {...groupProps}>
                    {getWaymarkShape(object.waymarkType) === WaymarkShape.Circle && (
                        <EllipseOutline
                            width={object.width}
                            height={object.height}
                            highlightProps={highlightProps}
                            highlightWidth={highlightWidth}
                            highlightHeight={highlightHeight}
                            highlightOffset={highlightOffset}
                        />
                    )}
                    {getWaymarkShape(object.waymarkType) === WaymarkShape.Square && (
                        <RectangleOutline
                            width={object.width}
                            height={object.height}
                            highlightProps={highlightProps}
                            highlightWidth={highlightWidth}
                            highlightHeight={highlightHeight}
                            highlightOffset={highlightOffset}
                        />
                    )}
                    <HideGroup
                        opacity={(object.opacity ?? 100) / 100}
                        clipFunc={function (ctx) {
                            const shape = getWaymarkShape(object.waymarkType);
                            if (shape === WaymarkShape.Circle) {
                                ctx.ellipse(
                                    object.width * 0.5,
                                    object.height * 0.5,
                                    object.width * 0.8,
                                    object.height * 0.8,
                                    0,
                                    0,
                                    2 * Math.PI,
                                );
                            } else {
                                ctx.rect(
                                    -object.width * 0.2,
                                    -object.height * 0.2,
                                    object.width * 1.4,
                                    object.height * 1.4,
                                );
                            }
                        }}
                    >
                        <Image
                            image={bgImage}
                            x={object.width / 2}
                            y={object.height / 2}
                            width={object.width * 2}
                            height={object.height * 2}
                            opacity={(object.bgOpacity ?? 100) / 100}
                            offsetX={object.width}
                            offsetY={object.height}
                        />
                        <Image
                            image={fgImage}
                            x={object.width / 2}
                            y={object.height / 2}
                            width={object.width}
                            height={object.height}
                            opacity={(object.fgOpacity ?? 100) / 100}
                            offsetX={object.width / 2}
                            offsetY={object.height / 2}
                            rotation={object.fgRotation ?? 0}
                        />
                    </HideGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<WaymarkObject>(ObjectType.Waymark, LayerName.Ground, WaymarkRenderer);

const WaymarkDetails: React.FC<ListComponentProps<WaymarkObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const icon = getWaymarkIconUrl(object.waymarkType, false);
    const name = t(`boardIcon.waymark.${object.waymarkType}`);
    return <DetailsItem icon={icon} name={name} object={object} {...props} />;
};

registerListComponent<WaymarkObject>(ObjectType.Waymark, WaymarkDetails);

export const WaymarkA = makeIcon(WaymarkType.A);
export const WaymarkB = makeIcon(WaymarkType.B);
export const WaymarkC = makeIcon(WaymarkType.C);
export const WaymarkD = makeIcon(WaymarkType.D);
export const Waymark1 = makeIcon(WaymarkType.One);
export const Waymark2 = makeIcon(WaymarkType.Two);
export const Waymark3 = makeIcon(WaymarkType.Three);
export const Waymark4 = makeIcon(WaymarkType.Four);
