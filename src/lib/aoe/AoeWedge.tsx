import { Wedge } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import { AoeProps } from './aoeProps';

export interface AoeWedgeProps extends AoeProps {
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
