import { Wedge } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import type { NativeStyle } from './nativeStyle';

export interface AoeWedgeProps extends NativeStyle {
    freeze?: boolean;
    radius: number;
    angle: number;
}

export default function AoeWedge({ freeze, radius, angle, ...styles }: AoeWedgeProps) {
    return (
        <AoeEffect freeze={freeze} {...styles}>
            <Wedge radius={radius} angle={angle} />
        </AoeEffect>
    );
}
