import { ShapeConfig } from 'konva/lib/Shape';
import { useTranslation } from 'react-i18next';
import { Circle, Ellipse, Group, Image, Rect } from 'react-konva';
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
import { RegularResizableObjectContainer } from './ResizableObjectContainer';
import { getWaymarkIconUrl, getWaymarkShape, WaymarkShape, WaymarkType } from './waymarkIcon';

const DEFAULT_SIZE = 31;

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
            size: DEFAULT_SIZE,
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

export const WaymarkComponent: React.FC<{
    type: WaymarkType;
    shape: WaymarkShape;
    size: number;
    bgOpacity?: number;
    fgOpacity?: number;
    fgRotation?: number;
    bgRotation?: number;
}> = ({ type, shape, size, bgOpacity, fgOpacity, fgRotation, bgRotation }) => {
    const [fgImage] = useImageTracked(getWaymarkIconUrl(type, false));
    const [bgImage] = useImageTracked(getWaymarkIconUrl(type, true));
    return (
        <>
            <Image
                image={bgImage}
                x={size / 2}
                y={size / 2}
                width={size * 2}
                height={size * 2}
                opacity={(bgOpacity ?? 100) / 100}
                offsetX={size}
                offsetY={size}
                rotation={bgRotation ?? 0}
                listening={false}
            />
            <Image
                image={fgImage}
                x={size / 2}
                y={size / 2}
                width={size}
                height={size}
                opacity={(fgOpacity ?? 100) / 100}
                offsetX={size / 2}
                offsetY={size / 2}
                rotation={fgRotation ?? 0}
                listening={false}
            />
            {shape === WaymarkShape.Circle && <Circle x={size / 2} y={size / 2} radius={size * 0.5} opacity={0} />}
            {shape === WaymarkShape.Square && (
                <Rect x={size * 0.07} y={size * 0.07} width={size * 0.86} height={size * 0.86} opacity={0} />
            )}
        </>
    );
};

export const WaymarkRenderer: React.FC<RendererProps<WaymarkObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);

    const strokeWidth = 1;

    const highlightOffset = strokeWidth * 4;
    const highlightWidth = object.size + highlightOffset;
    const highlightHeight = object.size + highlightOffset;
    const shape = getWaymarkShape(object.waymarkType);

    return (
        <RegularResizableObjectContainer
            object={object}
            transformerProps={{
                centeredScaling: true,
                padding: -object.size * 0.5 + 3,
                enabledAnchors: ['top-left', 'top-right', 'bottom-right', 'bottom-left'],
            }}
        >
            {(groupProps) => (
                <Group {...groupProps}>
                    {shape === WaymarkShape.Circle && (
                        <EllipseOutline
                            width={object.size}
                            height={object.size}
                            highlightProps={highlightProps}
                            highlightWidth={highlightWidth}
                            highlightHeight={highlightHeight}
                            highlightOffset={highlightOffset}
                        />
                    )}
                    {shape === WaymarkShape.Square && (
                        <RectangleOutline
                            width={object.size}
                            height={object.size}
                            highlightProps={highlightProps}
                            highlightWidth={highlightWidth}
                            highlightHeight={highlightHeight}
                            highlightOffset={highlightOffset}
                        />
                    )}
                    <HideGroup opacity={(object.opacity ?? 100) / 100}>
                        <WaymarkComponent
                            type={object.waymarkType}
                            shape={shape}
                            size={object.size}
                            bgOpacity={object.bgOpacity}
                            bgRotation={object.bgRotation}
                            fgOpacity={object.fgOpacity}
                            fgRotation={object.fgRotation}
                        />
                    </HideGroup>
                </Group>
            )}
        </RegularResizableObjectContainer>
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
