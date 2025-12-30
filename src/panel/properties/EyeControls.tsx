import { Switch } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { EyeObject, MechEyeObject } from '../../scene';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const EyeInvertControl: React.FC<PropertiesControlProps<MechEyeObject | EyeObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const invert = commonValue(objects, (obj) => !!obj.invert);

    const toggleInvert = () =>
        dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'invert', !invert)) });

    return <Switch label={t('properties.lookTowards')} checked={invert} onClick={toggleInvert} />;
};
