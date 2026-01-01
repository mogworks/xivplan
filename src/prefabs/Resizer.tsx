import Konva from 'konva';
import { Box } from 'konva/lib/shapes/Transformer';
import React, { RefObject, useLayoutEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { useScene } from '../SceneProvider';
import { ControlsPortal } from '../render/Portals';
import { ResizableObject, SceneObject, UnknownObject } from '../scene';
import { clamp } from '../util';
import { useShowResizer } from './highlight';

const DEFAULT_MIN_SIZE = 20;

const SNAP_ANGLE = 15;
const ROTATION_SNAPS = Array.from({ length: 360 / SNAP_ANGLE }).map((_, i) => i * SNAP_ANGLE);

const MIN_ANCHOR_SIZE = 6;
const MAX_ANCHOR_SIZE = 10;

export interface ResizerProps {
    object: ResizableObject & UnknownObject;
    nodeRef: RefObject<Konva.Group | null>;
    dragging?: boolean;
    minWidth?: number;
    minHeight?: number;
    transformerProps?: Konva.TransformerConfig;
    regular?: boolean;
    children: (onTransformEnd: (evt: Konva.KonvaEventObject<Event>) => void) => React.ReactElement;
}

export const Resizer: React.FC<ResizerProps> = ({
    object,
    nodeRef,
    dragging,
    minWidth,
    minHeight,
    transformerProps,
    regular,
    children,
}) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const trRef = useRef<Konva.Transformer>(null);

    const minWidthRequired = minWidth ?? DEFAULT_MIN_SIZE;
    const minHeightRequired = minHeight ?? DEFAULT_MIN_SIZE;

    const anchorSize = clamp((object.width + object.height) / 10, MIN_ANCHOR_SIZE, MAX_ANCHOR_SIZE);

    useLayoutEffect(() => {
        if (showResizer && trRef.current && nodeRef.current) {
            trRef.current.nodes([nodeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [object, showResizer, nodeRef, trRef]);

    const handleTransformEnd = () => {
        const node = nodeRef.current;
        if (!node) {
            return;
        }

        const newProps = regular
            ? {
                  x: Math.round(object.x + node.x()),
                  y: Math.round(object.y - node.y()),
                  rotation: Math.round(node.rotation()),
                  size: Math.round(Math.max(minWidthRequired, object.width * node.scaleX())),
              }
            : {
                  x: Math.round(object.x + node.x()),
                  y: Math.round(object.y - node.y()),
                  rotation: Math.round(node.rotation()),
                  width: Math.round(Math.max(minWidthRequired, object.width * node.scaleX())),
                  height: Math.round(Math.max(minHeightRequired, object.height * node.scaleY())),
              };

        node.scaleX(1);
        node.scaleY(1);
        node.x(0);
        node.y(0);
        node.clearCache();

        if (regular) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { width, height, ...newValue } = { ...object, ...newProps };
            dispatch({ type: 'update', value: newValue as SceneObject });
        } else {
            dispatch({ type: 'update', value: { ...object, ...newProps } as SceneObject });
        }
    };

    const boundBoxFunc = (oldBox: Box, newBox: Box) => {
        if (newBox.width < minWidthRequired || newBox.height < minHeightRequired) {
            return oldBox;
        }
        return newBox;
    };

    return (
        <>
            {
                // eslint-disable-next-line react-hooks/refs -- callback is only used in event handler
                children(handleTransformEnd)
            }
            {showResizer && (
                <ControlsPortal>
                    <Transformer
                        ref={trRef}
                        visible={!dragging}
                        rotationSnaps={ROTATION_SNAPS}
                        rotationSnapTolerance={2}
                        boundBoxFunc={boundBoxFunc}
                        anchorSize={anchorSize}
                        {...transformerProps}
                    />
                </ControlsPortal>
            )}
        </>
    );
};
