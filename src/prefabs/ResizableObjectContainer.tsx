import Konva from 'konva';
import React, { useRef, useState } from 'react';
import { KonvaNodeEvents } from 'react-konva';
import { ActivePortal } from '../render/Portals';
import { RegularResizableObject, ResizableObject, UnknownObject } from '../scene';
import { useIsDragging } from '../selection';
import { useKonvaCache } from '../useKonvaCache';
import { DraggableObject } from './DraggableObject';
import { Resizer, ResizerProps } from './Resizer';

export type GroupProps = Konva.NodeConfig & KonvaNodeEvents;

export interface ResizableObjectContainerProps {
    object: ResizableObject & UnknownObject;
    cache?: boolean;
    cacheKey?: unknown;
    resizerProps?: Partial<ResizerProps>;
    transformerProps?: Konva.TransformerConfig;
    regular?: boolean;
    children: (groupProps: GroupProps) => React.ReactElement;
}

export interface RegularResizableObjectContainerProps {
    object: RegularResizableObject & UnknownObject;
    cache?: boolean;
    cacheKey?: unknown;
    resizerProps?: Partial<ResizerProps>;
    transformerProps?: Konva.TransformerConfig;
    children: (groupProps: GroupProps) => React.ReactElement;
}

export const ResizableObjectContainer: React.FC<ResizableObjectContainerProps> = ({
    object,
    cache,
    cacheKey,
    resizerProps,
    transformerProps,
    regular,
    children,
}) => {
    const [resizing, setResizing] = useState(false);
    const dragging = useIsDragging(object);
    const shapeRef = useRef<Konva.Group>(null);

    useKonvaCache(shapeRef, { enabled: !!cache }, [cacheKey, object]);

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object}>
                <Resizer
                    object={object}
                    nodeRef={shapeRef}
                    dragging={dragging}
                    transformerProps={transformerProps}
                    regular={regular}
                    {...resizerProps}
                >
                    {(onTransformEnd) => {
                        return children({
                            ref: shapeRef,
                            onTransformStart: () => setResizing(true),
                            onTransformEnd: (e) => {
                                onTransformEnd(e);
                                setResizing(false);
                            },
                            offsetX: object.width / 2,
                            offsetY: object.height / 2,
                            rotation: object.rotation,
                        });
                    }}
                </Resizer>
            </DraggableObject>
        </ActivePortal>
    );
};

export const RegularResizableObjectContainer: React.FC<RegularResizableObjectContainerProps> = ({
    object,
    cache,
    cacheKey,
    resizerProps,
    transformerProps,
    children,
}) => {
    const resizableObject = {
        ...object,
        width: object.size,
        height: object.size,
        size: undefined,
    } as ResizableObjectContainerProps['object'];
    return ResizableObjectContainer({
        object: resizableObject,
        cache,
        cacheKey,
        resizerProps,
        transformerProps,
        regular: true,
        children,
    });
};
