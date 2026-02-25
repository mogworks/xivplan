import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { MIN_INNER_RADIUS, MIN_RADIUS, MIN_RADIUS_GAP } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { InnerRadiusObject, RadiusObject, isInnerRadiusObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const RadiusControl: React.FC<PropertiesControlProps<RadiusObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const radius = commonValue(objects, (obj) => obj.radius);
    const hasInnerRadius = objects.every(isInnerRadiusObject);

    const onRadiusChanged = useSpinChanged((newRadius: number) => {
        const clampedRadius = Math.max(MIN_RADIUS, newRadius);
        dispatch({
            type: 'update',
            value: objects.map((obj) => {
                if (!isInnerRadiusObject(obj)) {
                    return { ...obj, radius: clampedRadius };
                }

                let radius = clampedRadius;
                let innerRadius = obj.innerRadius;

                // 当外径继续减小至小于 内径 + GAP 时，同时减小两者以保持 GAP
                if (radius < innerRadius + MIN_RADIUS_GAP) {
                    const delta = innerRadius + MIN_RADIUS_GAP - radius;
                    innerRadius = Math.max(MIN_INNER_RADIUS, innerRadius - delta);
                    // 重新计算外径以保持 GAP（如果因 MIN_INNER_RADIUS 夹取导致外径需要回退）
                    radius = Math.max(innerRadius + MIN_RADIUS_GAP, radius);
                }

                return { ...obj, radius, innerRadius };
            }),
        });
    });

    const label = hasInnerRadius ? t('properties.radius1') : t('properties.radius');

    return (
        <Field label={label} className={classes.cell}>
            <SpinButton value={radius} onChange={onRadiusChanged} min={MIN_RADIUS} step={1} />
        </Field>
    );
};

export const InnerRadiusControl: React.FC<PropertiesControlProps<RadiusObject & InnerRadiusObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const innerRadius = commonValue(objects, (obj) => obj.innerRadius);

    const onInnerRadiusChanged = useSpinChanged((newInnerRadius: number) => {
        const clampedInner = Math.max(MIN_INNER_RADIUS, newInnerRadius);
        dispatch({
            type: 'update',
            value: objects.map((obj) => {
                if (!isInnerRadiusObject(obj)) {
                    return obj;
                }

                const innerRadius = clampedInner;
                let radius = obj.radius;

                // 当内径继续增大至超过 外径 - GAP 时，同时增大两者以保持 GAP
                if (innerRadius > radius - MIN_RADIUS_GAP) {
                    radius = innerRadius + MIN_RADIUS_GAP;
                }

                return { ...obj, innerRadius, radius };
            }),
        });
    });

    return (
        <Field label={t('properties.radius2')} className={classes.cell}>
            <SpinButton value={innerRadius} onChange={onInnerRadiusChanged} min={MIN_INNER_RADIUS} step={1} />
        </Field>
    );
};
