import { Arc } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import { AoeProps } from './aoeProps';

export interface AoeArcProps extends AoeProps {
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
