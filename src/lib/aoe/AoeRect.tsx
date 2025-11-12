import { Rect } from 'react-konva';
import type { ZoneStyle } from '../../prefabs/zone/style';
import { AoeEffect } from './AoeEffect';

export interface AoeRectProps {
    offsetX?: number;
    offsetY?: number;
    width: number;
    height: number;
    zoneStyle: ZoneStyle;
    freezeChildren?: boolean;
}

export default function AoeRect(props: AoeRectProps) {
    const isNative = props.zoneStyle.native === true;

    if (isNative) {
        return (
            <AoeEffect freezeChildren={props.freezeChildren} {...props.zoneStyle}>
                <Rect
                    offsetX={props.offsetX ?? 0}
                    offsetY={props.offsetY ?? 0}
                    width={props.width}
                    height={props.height}
                />
            </AoeEffect>
        );
    }

    return (
        <Rect
            offsetX={props.offsetX ?? 0}
            offsetY={props.offsetY ?? 0}
            width={props.width}
            height={props.height}
            {...props.zoneStyle}
        />
    );
}
