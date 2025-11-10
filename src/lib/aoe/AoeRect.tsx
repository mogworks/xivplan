import { Rect } from 'react-konva';
import type { ZoneStyle, ZoneStyleClassic } from '../../prefabs/zone/style';
import { AoeEffect, STROKE_WIDTH } from './AoeEffect';

export interface AoeRectProps {
    width: number;
    height: number;
    zoneStyle: ZoneStyle;
}

export default function AoeRect(props: AoeRectProps) {
    const isRealistic = props.zoneStyle.realistic === true;

    if (isRealistic) {
        return (
            <AoeEffect cacheKeys={[props.width, props.height, props.zoneStyle]} {...props.zoneStyle}>
                <Rect
                    x={STROKE_WIDTH / 2}
                    y={STROKE_WIDTH / 2}
                    width={props.width - STROKE_WIDTH}
                    height={props.height - STROKE_WIDTH}
                />
            </AoeEffect>
        );
    }

    const s = props.zoneStyle as ZoneStyleClassic;
    return (
        <Rect
            x={s.strokeWidth / 2}
            y={s.strokeWidth / 2}
            width={props.width - s.strokeWidth}
            height={props.height - s.strokeWidth}
            {...props.zoneStyle}
        />
    );
}
