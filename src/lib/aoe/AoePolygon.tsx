import { RegularPolygon } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import { AoeProps } from './aoeProps';

export interface AoePolygonProps extends AoeProps {
    freeze?: boolean;
    radius: number;
    sides: number;
}

export default function AoePolygon({ freeze, radius, sides, ...styles }: AoePolygonProps) {
    return (
        <AoeEffect freeze={freeze} {...styles}>
            <RegularPolygon radius={radius} sides={sides} {...styles} />
        </AoeEffect>
    );
}
