import { Circle } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import { AoeProps } from './aoeProps';

export interface AoeCircleProps extends AoeProps {
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
