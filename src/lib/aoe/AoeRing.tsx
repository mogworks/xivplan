import { Ring } from 'react-konva';
import type { ZoneStyle } from '../../prefabs/zone/style';
import { AoeEffect } from './AoeEffect';

export interface AoeRingProps {
    innerRadius: number;
    outerRadius: number;
    zoneStyle: ZoneStyle;
    freezeChildren?: boolean;
}

export default function AoeRing(props: AoeRingProps) {
    const isNative = props.zoneStyle.native === true;

    if (isNative) {
        return (
            <AoeEffect freezeChildren={props.freezeChildren} {...props.zoneStyle}>
                <Ring innerRadius={props.innerRadius} outerRadius={props.outerRadius} />
            </AoeEffect>
        );
    }

    return <Ring innerRadius={props.innerRadius} outerRadius={props.outerRadius} {...props.zoneStyle} />;
}
