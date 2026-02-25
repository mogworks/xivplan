import { Ring } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import { AoeProps } from './aoeProps';

export interface AoeDonutProps extends AoeProps {
    freeze?: boolean;
    innerRadius: number;
    outerRadius: number;
}

export default function AoeDonut({ freeze, innerRadius, outerRadius, ...styles }: AoeDonutProps) {
    return (
        <AoeEffect freeze={freeze} {...styles}>
            <Ring innerRadius={innerRadius} outerRadius={outerRadius} />
        </AoeEffect>
    );
}
