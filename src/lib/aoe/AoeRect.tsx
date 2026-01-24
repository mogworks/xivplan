import { Rect } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import { AoeProps } from './aoeProps';

export interface AoeRectProps extends AoeProps {
    freeze?: boolean;
    offsetX?: number;
    offsetY?: number;
    rotation?: number;
    width: number;
    height: number;
}

export default function AoeRect({ freeze, offsetX, offsetY, rotation, width, height, ...styles }: AoeRectProps) {
    return (
        <AoeEffect freeze={freeze} {...styles}>
            <Rect
                offsetX={offsetX ?? 0}
                offsetY={offsetY ?? 0}
                rotation={rotation ?? 0}
                width={width}
                height={height}
            />
        </AoeEffect>
    );
}
