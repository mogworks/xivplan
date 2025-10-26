import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeferredInput } from '../../DeferredInput';
import { useScene } from '../../SceneProvider';
import { ImageObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ImageControl: React.FC<PropertiesControlProps<ImageObject>> = ({ objects }) => {
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const image = commonValue(objects, (obj) => obj.image);

    const setImage = (image: string) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, image })), transient: true });

    return (
        <Field label={t('properties.imageUrl')}>
            <DeferredInput
                value={image}
                onChange={(dev, data) => setImage(data.value)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
        </Field>
    );
};
