import { Rect } from 'react-konva';
import { AoeEffect, STROKE_WIDTH } from './AoeEffect';

export default function AoeRect(props: { width: number; height: number }) {
    return (
        <AoeEffect cacheKeys={[props.width, props.height]}>
            <Rect
                x={STROKE_WIDTH / 2}
                y={STROKE_WIDTH / 2}
                width={props.width - STROKE_WIDTH}
                height={props.height - STROKE_WIDTH}
            />
        </AoeEffect>
    );
}
