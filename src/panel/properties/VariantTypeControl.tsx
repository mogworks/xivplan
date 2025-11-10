import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { VariantObject, VariantType } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const VariantTypeControl: React.FC<PropertiesControlProps<VariantObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const solid = commonValue(objects, (obj) => obj.variantType === 'solid');
    const hollow = commonValue(objects, (obj) => obj.variantType === 'hollow');

    const variant = solid ? 'solid' : hollow ? 'hollow' : 'realistic';

    const onVariantChanged = (variant: VariantType) => {
        if (variant === 'solid') {
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, variantType: 'solid' })) });
        } else if (variant === 'hollow') {
            dispatch({
                type: 'update',
                value: objects.map((obj) => ({ ...obj, variantType: 'hollow' })),
            });
        } else {
            dispatch({
                type: 'update',
                value: objects.map((obj) => ({ ...obj, variantType: 'realistic' })),
            });
        }
    };

    return (
        <Field label={t('properties.style')}>
            <SegmentedGroup
                name="shape-style"
                value={variant}
                onChange={(ev, data) => onVariantChanged(data.value as VariantType)}
            >
                <Segment value={'realistic'} icon={t('properties.realistic')} size="mediumText" />
                <Segment value={'solid'} icon={t('properties.solid')} size="mediumText" />
                <Segment value={'hollow'} icon={t('properties.hollow')} size="mediumText" />
            </SegmentedGroup>
        </Field>
    );
};
