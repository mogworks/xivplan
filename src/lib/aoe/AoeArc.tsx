import { Arc } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import type { NativeStyle } from './nativeStyle';

export interface AoeArcProps extends NativeStyle {
    freeze?: boolean;
    innerRadius: number;
    outerRadius: number;
    angle: number;
}

export default function AoeArc({ freeze, innerRadius, outerRadius, angle, ...styles }: AoeArcProps) {
    return (
        <AoeEffect freeze={freeze} {...styles}>
            <Arc innerRadius={innerRadius} outerRadius={outerRadius} angle={angle} />
        </AoeEffect>
    );
}
