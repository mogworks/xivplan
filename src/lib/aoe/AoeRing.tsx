import { Ring } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import type { NativeStyle } from './nativeStyle';

export interface AoeRingProps extends NativeStyle {
    freeze?: boolean;
    innerRadius: number;
    outerRadius: number;
}

export default function AoeRing({ freeze, innerRadius, outerRadius, ...styles }: AoeRingProps) {
    return (
        <AoeEffect freeze={freeze} {...styles}>
            <Ring innerRadius={innerRadius} outerRadius={outerRadius} />
        </AoeEffect>
    );
}
