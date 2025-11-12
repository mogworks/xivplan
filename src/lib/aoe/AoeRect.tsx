import { Rect } from 'react-konva';
import { AoeEffect } from './AoeEffect';
import type { NativeStyle } from './nativeStyle';

export interface AoeRectProps extends NativeStyle {
    freeze?: boolean;
    offsetX?: number;
    offsetY?: number;
    width: number;
    height: number;
}

export default function AoeRect({ freeze, offsetX, offsetY, width, height, ...styles }: AoeRectProps) {
    return (
        <AoeEffect freeze={freeze} {...styles}>
            <Rect offsetX={offsetX ?? 0} offsetY={offsetY ?? 0} width={width} height={height} />
        </AoeEffect>
    );
}
