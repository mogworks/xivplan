import { Field, mergeClasses } from '@fluentui/react-components';
import { CircleRegular, SquareRegular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OpacitySlider } from '../../OpacitySlider';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { WaymarkOrderType, WaymarkPlacementType } from '../../prefabs/waymarkIcon';
import { WaymarkGroupObject, WaymarkObject } from '../../scene';
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
        <>
            <Field label={t('waymark.fgRotation')}>
                <SpinButtonUnits
                    value={fgRotation ?? 0}
                    onChange={onFgRotationChanged}
                    step={1}
                    fractionDigits={1}
                    suffix="°"
                />
            </Field>
            <Field label={t('waymark.bgRotation')}>
                <SpinButtonUnits
                    value={bgRotation ?? 0}
                    onChange={onBgRotationChanged}
                    step={1}
                    fractionDigits={1}
                    suffix="°"
                />
            </Field>
        </>
    );
};

export const WaymarkGroupControl: React.FC<PropertiesControlProps<WaymarkGroupObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const placementType = commonValue(objects, (obj) => obj.placementType);
    const orderType = commonValue(objects, (obj) => obj.orderType);

    const onPlacementTypeChanged = (placementType: WaymarkPlacementType) => {
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, placementType })) });
    };
    const onOrderTypeChanged = (orderType: WaymarkOrderType) => {
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, orderType })) });
    };

    return (
        <div className={mergeClasses(classes.row)}>
            <Field label={t('properties.waymarkGroup.placementType')}>
                <SegmentedGroup
                    name="waymark-placement-type"
                    value={placementType}
                    onChange={(ev, data) => onPlacementTypeChanged(data.value as WaymarkPlacementType)}
                >
                    <Segment
                        value={WaymarkPlacementType.Circle}
                        icon={<CircleRegular />}
                        title={t('properties.waymarkGroup.circle')}
                    />
                    <Segment
                        value={WaymarkPlacementType.Square}
                        icon={<SquareRegular />}
                        title={t('properties.waymarkGroup.square')}
                    />
                </SegmentedGroup>
            </Field>
            <Field label={t('properties.waymarkGroup.orderType')}>
                <SegmentedGroup
                    name="waymark-order-type"
                    value={orderType}
                    onChange={(ev, data) => onOrderTypeChanged(data.value as WaymarkOrderType)}
                >
                    <Segment
                        value={WaymarkOrderType.A2B3}
                        icon={'1'}
                        size="mediumText"
                        title={t('properties.waymarkGroup.a2b3')}
                    />
                    <Segment
                        value={WaymarkOrderType.A1B2}
                        icon={'2'}
                        size="mediumText"
                        title={t('properties.waymarkGroup.a1b2')}
                    />
                </SegmentedGroup>
            </Field>
        </div>
    );
};
