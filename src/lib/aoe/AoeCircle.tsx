import { Circle } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import { NativeStyle } from './nativeStyle';

export interface AoeCircleProps extends NativeStyle {
    freeze?: boolean;
    radius: number;
}

export default function AoeCircle({ freeze, radius, ...styles }: AoeCircleProps) {
    return (
        <AoeEffect freeze={freeze} {...styles}>
            <Circle radius={radius} />
        </AoeEffect>
    );
}
