import { Field } from '@fluentui/react-components';
import { CircleFilled, CircleRegular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { HollowObject } from '../../scene';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

enum Styles {
    Solid = 'solid',
    Hollow = 'hollow',
}

export const HollowControl: React.FC<PropertiesControlProps<HollowObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const hollow = commonValue(objects, (obj) => !!obj.hollow);
    const style = hollow ? Styles.Hollow : Styles.Solid;

    const onHollowChanged = (style: string) => {
        const hollow = style === Styles.Hollow;
        dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'hollow', hollow)) });
    };

    return (
        <Field label={t('properties.style')}>
            <SegmentedGroup name="shape-style" value={style} onChange={(ev, data) => onHollowChanged(data.value)}>
                <Segment value={Styles.Solid} icon={<CircleFilled />} title={t('properties.solid')} />
                <Segment value={Styles.Hollow} icon={<CircleRegular />} title={t('properties.hollow')} />
            </SegmentedGroup>
        </Field>
    );
};
