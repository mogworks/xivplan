import { Field } from '@fluentui/react-components';
import React from 'react';
import { DeferredInput } from '../DeferredInput';
import { OpacitySlider } from '../OpacitySlider';
import { useScene } from '../SceneProvider';
import { useTranslation } from 'react-i18next';

export const ArenaBackgroundEdit: React.FC = () => {
    const { scene, dispatch } = useScene();
    const { t } = useTranslation();
    return (
        <>
            <Field label={t('arena.backgroundImageUrl')}>
                <DeferredInput
                    value={scene.arena.backgroundImage}
                    onChange={(ev, data) => {
                        dispatch({ type: 'arenaBackground', value: data.value, transient: true });
                    }}
                    onCommit={() => dispatch({ type: 'commit' })}
                />
            </Field>
            {scene.arena.backgroundImage && (
                <OpacitySlider
                    label={t('arena.backgroundImageOpacity')}
                    value={scene.arena.backgroundOpacity ?? 100}
                    onChange={(ev, data) => {
                        dispatch({ type: 'arenaBackgroundOpacity', value: data.value, transient: data.transient });
                    }}
                    onCommit={() => dispatch({ type: 'commit' })}
                />
            )}
        </>
    );
};
