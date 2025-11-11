import { Circle } from 'react-konva';
import type { ZoneStyle, ZoneStyleSimple } from '../../prefabs/zone/style';
import { AoeEffect, STROKE_WIDTH } from './AoeEffect';

export interface AoeCircleProps {
    offsetX?: number;
    offsetY?: number;
    radius: number;
    zoneStyle: ZoneStyle;
}

export default function AoeCircle(props: AoeCircleProps) {
    const isNative = props.zoneStyle.native === true;

    if (isNative) {
        return (
            <AoeEffect cacheKeys={[props.radius, props.zoneStyle]} {...props.zoneStyle}>
                <Circle
                    offsetX={props.offsetX ?? 0}
                    offsetY={props.offsetY ?? 0}
                    radius={props.radius - STROKE_WIDTH / 2}
                />
            </AoeEffect>
        );
    }

    const s = props.zoneStyle as ZoneStyleSimple;
    return (
        <Circle
            offsetX={props.offsetX ?? 0}
            offsetY={props.offsetY ?? 0}
            radius={props.radius - s.strokeWidth / 2}
            {...props.zoneStyle}
        />
    );
}
