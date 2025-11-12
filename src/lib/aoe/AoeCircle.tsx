import { Circle } from 'react-konva';
import type { ZoneStyle } from '../../prefabs/zone/style';
import { AoeEffect } from './AoeEffect';

export interface AoeCircleProps {
    radius: number;
    zoneStyle: ZoneStyle;
    freezeChildren?: boolean;
}

export default function AoeCircle(props: AoeCircleProps) {
    const isNative = props.zoneStyle.native === true;

    if (isNative) {
        return (
            <AoeEffect freezeChildren={props.freezeChildren} {...props.zoneStyle}>
                <Circle radius={props.radius} />
            </AoeEffect>
        );
    }

    return <Circle radius={props.radius} {...props.zoneStyle} />;
}
