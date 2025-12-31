import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OpacitySlider } from '../../OpacitySlider';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { WaymarkObject } from '../../scene';
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
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const fgRotation = commonValue(objects, (obj) => obj.fgRotation);

    const onFgRotationChanged = useSpinChanged((fgRotation: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, fgRotation })) }),
    );

    return (
        <Field label={t('waymark.fgRotation')}>
            <SpinButtonUnits
                value={fgRotation ?? 0}
                onChange={onFgRotationChanged}
                step={5}
                fractionDigits={1}
                suffix="°"
            />
        </Field>
    );
};
