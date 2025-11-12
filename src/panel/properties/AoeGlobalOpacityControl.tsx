import React from 'react';
import { useTranslation } from 'react-i18next';
import { OpacitySlider } from '../../OpacitySlider';
import { ZoneStyleObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const AoeGlobalOpacityControl: React.FC<PropertiesControlProps<ZoneStyleObject>> = ({ objects, className }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const globalOpacity = commonValue(objects, (obj) => obj.globalOpacity);
    const hide = commonValue(objects, (obj) => !!obj.hide);

    const setGlobalOpacity = (newPercent: number, transient: boolean) => {
        const newOpacity = Number(((newPercent ?? 0) / 100).toFixed(2));
        if (newOpacity !== globalOpacity) {
            dispatch({
                type: 'update',
                value: objects.map((obj) => ({ ...obj, globalOpacity: newOpacity })),
                transient,
            });
        }
    };

    const displayPercent = Math.round((globalOpacity ?? 1) * 100);

    return (
        <OpacitySlider
            className={className}
            label={t('aoe.globalOpacity')}
            value={displayPercent}
            disabled={hide}
            onChange={(ev, data) => setGlobalOpacity(data.value, data.transient)}
            onCommit={() => dispatch({ type: 'commit' })}
        />
    );
};
