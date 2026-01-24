import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompactColorPicker } from '../../CompactColorPicker';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';
import { ColoredObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { useColorSwatches } from '../../theme';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ColorControl: React.FC<PropertiesControlProps<ColoredObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const color = commonValue(objects, (obj) => obj.color);

    const onColorChanged = (color: string, transient: boolean) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, color })), transient });

    return (
        <CompactColorPicker
            label={t('properties.color')}
            color={color ?? ''}
            onChange={(data) => onColorChanged(data.value, data.transient)}
            onCommit={() => dispatch({ type: 'commit' })}
        />
    );
};

export const ColorSwatchControl: React.FC<PropertiesControlProps<ColoredObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const swatches = useColorSwatches();

    const color = commonValue(objects, (obj) => obj.color);

    const setColor = (color: string) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, color })) });

    return (
        <CompactSwatchColorPicker
            swatches={swatches}
            selectedValue={color ?? ''}
            onSelectionChange={(ev, data) => setColor(data.selectedSwatch)}
        />
    );
};
