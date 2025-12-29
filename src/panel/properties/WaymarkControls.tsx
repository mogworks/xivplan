import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OpacitySlider } from '../../OpacitySlider';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { WaymarkObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const WaymarkOpacityControl: React.FC<PropertiesControlProps<WaymarkObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const hide = commonValue(objects, (obj) => !!obj.hide);
    const fgOpacity = commonValue(objects, (obj) => obj.fgOpacity);
    const bgOpacity = commonValue(objects, (obj) => obj.bgOpacity);

    const setFgOpacity = (newOpacity: number, transient: boolean) => {
        if (newOpacity !== fgOpacity) {
            dispatch({
                type: 'update',
                value: objects.map((obj) => ({ ...obj, fgOpacity: newOpacity })),
                transient,
            });
        }
    };

    const setBgOpacity = (newOpacity: number, transient: boolean) => {
        if (newOpacity !== bgOpacity) {
            dispatch({
                type: 'update',
                value: objects.map((obj) => ({ ...obj, bgOpacity: newOpacity })),
                transient,
            });
        }
    };

    return (
        <>
            <OpacitySlider
                label={t('waymark.fgOpacity')}
                value={fgOpacity ?? 100}
                disabled={hide}
                onChange={(ev, data) => setFgOpacity(data.value, data.transient)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
            <OpacitySlider
                label={t('waymark.bgOpacity')}
                value={bgOpacity ?? 100}
                disabled={hide}
                onChange={(ev, data) => setBgOpacity(data.value, data.transient)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
        </>
    );
};

export const WaymarkRotationControl: React.FC<PropertiesControlProps<WaymarkObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const fgRotation = commonValue(objects, (obj) => obj.fgRotation);
    const bgRotation = commonValue(objects, (obj) => obj.bgRotation);

    const onFgRotationChanged = useSpinChanged((fgRotation: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, fgRotation })) }),
    );

    const onBgRotationChanged = useSpinChanged((bgRotation: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, bgRotation })) }),
    );

    return (
        <div className={classes.row}>
            <Field label={t('waymark.fgRotation')} className={classes.cell}>
                <SpinButtonUnits
                    value={fgRotation ?? 0}
                    onChange={onFgRotationChanged}
                    step={5}
                    fractionDigits={1}
                    suffix="°"
                />
            </Field>
            <Field label={t('waymark.bgRotation')} className={classes.cell}>
                <SpinButtonUnits
                    value={bgRotation ?? 0}
                    onChange={onBgRotationChanged}
                    step={5}
                    fractionDigits={1}
                    suffix="°"
                />
            </Field>
        </div>
    );
};
