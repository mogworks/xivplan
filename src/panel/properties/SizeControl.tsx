import { Field, mergeClasses } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { MIN_SIZE } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { RegularResizableObject, ResizableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const SizeControl: React.FC<PropertiesControlProps<ResizableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const width = commonValue(objects, (obj) => obj.width);
    const height = commonValue(objects, (obj) => obj.height);

    const onWidthChanged = useSpinChanged((width: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, width })) }),
    );
    const onHeightChanged = useSpinChanged((height: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, height })) }),
    );

    return (
        <div className={mergeClasses(classes.row, classes.rightGap)}>
            <Field label={t('properties.width')}>
                <SpinButton value={width} onChange={onWidthChanged} min={MIN_SIZE} step={1} />
            </Field>
            <Field label={t('properties.height')}>
                <SpinButton value={height} onChange={onHeightChanged} min={MIN_SIZE} step={1} />
            </Field>
        </div>
    );
};

export const RegularSizeControl: React.FC<PropertiesControlProps<RegularResizableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const size = commonValue(objects, (obj) => obj.size);

    const onSizeChanged = useSpinChanged((size: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, size })) }),
    );

    return (
        <div className={mergeClasses(classes.row, classes.rightGap)}>
            <Field label={t('properties.size')} className={classes.cell}>
                <SpinButton value={size} onChange={onSizeChanged} min={MIN_SIZE} step={1} />
            </Field>
        </div>
    );
};
