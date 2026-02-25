import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MAX_FAN_ANGLE, MIN_FAN_ANGLE } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { FanProps } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const FanAngleControl: React.FC<PropertiesControlProps<FanProps>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const fanAngle = commonValue(objects, (obj) => obj.fanAngle);

    const onAngleChanged = useSpinChanged((fanAngle: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, fanAngle })) }),
    );

    return (
        <Field label={t('properties.angle')} className={classes.cell}>
            <SpinButtonUnits
                value={fanAngle}
                onChange={onAngleChanged}
                min={MIN_FAN_ANGLE}
                max={MAX_FAN_ANGLE}
                step={5}
                fractionDigits={1}
                suffix="°"
            />
        </Field>
    );
};
