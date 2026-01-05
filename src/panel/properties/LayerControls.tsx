import { Dropdown, Field, Option } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayerName } from '../../render/layers';
import { getDefaultLayer } from '../../render/ObjectRegistry';
import { NamedObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const LayerControl: React.FC<PropertiesControlProps<NamedObject>> = ({ objects, className }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const layer = commonValue(objects, (obj) => obj.layer ?? getDefaultLayer(obj.type));

    const setLayer = (newLayer: LayerName) =>
        dispatch({
            type: 'update',
            value: objects.map((obj) => {
                const defaultLayer = getDefaultLayer(obj.type);
                if (newLayer === defaultLayer) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { layer, ...rest } = obj;
                    return rest;
                }
                return { ...obj, layer: newLayer };
            }),
        });

    return (
        <Field label={t('properties.layer')} className={className}>
            <Dropdown
                appearance="outline"
                value={layer ? t(`layer.${layer}`) : ''}
                selectedOptions={[layer || '']}
                onOptionSelect={(ev, data) => setLayer(data.optionValue as LayerName)}
            >
                {Object.values(LayerName)
                    .filter((key) => key !== 'active' && key !== 'control')
                    .sort((a, b) => {
                        const order = ['fg', 'default', 'ground'];
                        return order.indexOf(a) - order.indexOf(b);
                    })
                    .map((key) => {
                        const layerText = t(`layer.${key}`);
                        return (
                            <Option key={key} value={key} text={layerText}>
                                {layerText}
                            </Option>
                        );
                    })}
            </Dropdown>
        </Field>
    );
};
