import { Field, makeStyles } from '@fluentui/react-components';
import {
    ChevronCircleUpFilled,
    ChevronCircleUpRegular,
    CircleFilled,
    CircleRegular,
    bundleIcon,
} from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { ThreeQuarterCircleFilled, ThreeQuarterCircleRegular } from '../../icon/ThreeQuarterCircle';
import { TargetObject, TargetRingStyle } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const ChevronCircleUpIcon = bundleIcon(ChevronCircleUpFilled, ChevronCircleUpRegular);
const ThreeQuarterCircleIcon = bundleIcon(ThreeQuarterCircleFilled, ThreeQuarterCircleRegular);

const DirectionalIcon: React.FC = () => {
    const classes = useStyles();
    return <ThreeQuarterCircleIcon className={classes.directional} />;
};

export const TargetRingControl: React.FC<PropertiesControlProps<TargetObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const ring = commonValue(objects, (obj) => obj.ring);

    const onDirectionalChanged = (ring: TargetRingStyle) => {
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, ring })) });
    };

    return (
        <Field label={t('properties.ringStyle')} className={classes.cell}>
            <SegmentedGroup
                name="target-ring"
                value={ring}
                onChange={(ev, data) => onDirectionalChanged(data.value as TargetRingStyle)}
            >
                <Segment
                    value={TargetRingStyle.Directional}
                    icon={<DirectionalIcon />}
                    title={t('properties.directional')}
                />
                <Segment
                    value={TargetRingStyle.Omnidirectional}
                    icon={<ChevronCircleUpIcon />}
                    title={t('properties.omnidirectional')}
                />
                <Segment
                    value={TargetRingStyle.NoDirection}
                    icon={<CircleIcon />}
                    title={t('properties.noDirection')}
                />
            </SegmentedGroup>
        </Field>
    );
};

const useStyles = makeStyles({
    directional: {
        transform: 'rotate(135deg)',
    },
});
