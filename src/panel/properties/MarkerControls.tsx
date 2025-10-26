import { Field } from '@fluentui/react-components';
import { CircleFilled, CircleRegular, SquareFilled, SquareRegular, bundleIcon } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { MarkerObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const SquareIcon = bundleIcon(SquareFilled, SquareRegular);

export const MarkerShapeControl: React.FC<PropertiesControlProps<MarkerObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const shape = commonValue(objects, (obj) => obj.shape);

    const onShapeChanged = (shape: string) => {
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, shape })) });
    };

    return (
        <Field label={t('properties.shape')}>
            <SegmentedGroup name="shape" value={shape} onChange={(ev, data) => onShapeChanged(data.value)}>
                <Segment value="circle" icon={<CircleIcon />} title={t('properties.circle')} />
                <Segment value="square" icon={<SquareIcon />} title={t('properties.square')} />
            </SegmentedGroup>
        </Field>
    );
};
