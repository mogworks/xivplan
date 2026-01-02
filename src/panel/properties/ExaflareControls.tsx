import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import {
    EXAFLARE_LENGTH_MAX,
    EXAFLARE_LENGTH_MIN,
    EXAFLARE_SPACING_MAX,
    EXAFLARE_SPACING_MIN,
} from '../../prefabs/zone/constants';
import { ExaflareZone, MechExaflareCircleObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ExaflareLengthControl: React.FC<PropertiesControlProps<ExaflareZone | MechExaflareCircleObject>> = ({
    objects,
}) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const length = commonValue(objects, (obj) => obj.length);

    const onLengthChanged = useSpinChanged((length: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, length })) }),
    );

    return (
        <Field label={t('properties.length')} className={classes.cell}>
            <SpinButton
                value={length}
                onChange={onLengthChanged}
                min={EXAFLARE_LENGTH_MIN}
                max={EXAFLARE_LENGTH_MAX}
                step={1}
            />
        </Field>
    );
};

export const ExaflareSpacingControl: React.FC<PropertiesControlProps<ExaflareZone | MechExaflareCircleObject>> = ({
    objects,
}) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const spacing = commonValue(objects, (obj) => obj.spacing);

    const onSpacingChanged = useSpinChanged((spacing: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, spacing })) }),
    );

    return (
        <Field label={t('properties.spacing')} className={classes.cell}>
            <SpinButtonUnits
                value={spacing}
                suffix="%"
                onChange={onSpacingChanged}
                min={EXAFLARE_SPACING_MIN}
                max={EXAFLARE_SPACING_MAX}
                step={10}
            />
        </Field>
    );
};
