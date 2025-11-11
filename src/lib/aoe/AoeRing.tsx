import { Ring } from 'react-konva';
import type { ZoneStyle, ZoneStyleSimple } from '../../prefabs/zone/style';
import { AoeEffect, STROKE_WIDTH } from './AoeEffect';

export interface AoeRingProps {
    offsetX?: number;
    offsetY?: number;
    innerRadius: number;
    outerRadius: number;
    zoneStyle: ZoneStyle;
}

export default function AoeRing(props: AoeRingProps) {
    const isNative = props.zoneStyle.native === true;

    if (isNative) {
        return (
            <AoeEffect cacheKeys={[props.innerRadius, props.outerRadius, props.zoneStyle]} {...props.zoneStyle}>
                <Ring
                    offsetX={props.offsetX ?? 0}
                    offsetY={props.offsetY ?? 0}
                    innerRadius={props.innerRadius + STROKE_WIDTH / 2}
                    outerRadius={props.outerRadius - STROKE_WIDTH / 2}
                />
            </AoeEffect>
        );
    }

    const s = props.zoneStyle as ZoneStyleSimple;
    return (
        <Ring
            offsetX={props.offsetX ?? 0}
            offsetY={props.offsetY ?? 0}
            innerRadius={props.innerRadius + s.strokeWidth / 2}
            outerRadius={props.outerRadius - s.strokeWidth / 2}
            {...props.zoneStyle}
        />
    );
}
