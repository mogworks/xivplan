import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { MIN_STARBURST_SPOKE_WIDTH } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { StarburstProps } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const MIN_SPOKE_COUNT = 3;
const MAX_SPOKE_COUNT = 16;

export const StarburstSpokeWidthControl: React.FC<PropertiesControlProps<StarburstProps>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const spokeWidth = commonValue(objects, (obj) => obj.spokeWidth);

    const onSpokeWidthChanged = useSpinChanged((spokeWidth: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, spokeWidth })) }),
    );

    return (
        <Field label={t('properties.spokeWidth')} className={classes.cell}>
            <SpinButton value={spokeWidth} onChange={onSpokeWidthChanged} min={MIN_STARBURST_SPOKE_WIDTH} step={5} />
        </Field>
    );
};

export const StarburstSpokeCountControl: React.FC<PropertiesControlProps<StarburstProps>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const spokes = commonValue(objects, (obj) => obj.spokes);

    const onSpokesChanged = useSpinChanged((spokes: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, spokes })) }),
    );

    return (
        <Field label={t('properties.spokes')} className={classes.cell}>
            <SpinButton
                value={spokes}
                onChange={onSpokesChanged}
                min={MIN_SPOKE_COUNT}
                max={MAX_SPOKE_COUNT}
                step={1}
            />
        </Field>
    );
};
