import { Switch } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { MechStackObject } from '../../scene';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const StackMultiHitControl: React.FC<PropertiesControlProps<MechStackObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const multiHit = commonValue(objects, (obj) => !!obj.multiHit);

    const toggleMultiHit = () =>
        dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'multiHit', !multiHit)) });

    return <Switch label={t('properties.multiHit')} checked={multiHit} onClick={toggleMultiHit} />;
};
