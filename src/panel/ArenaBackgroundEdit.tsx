import { Divider, Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeferredInput } from '../DeferredInput';
import { OpacitySlider } from '../OpacitySlider';
import { useScene } from '../SceneProvider';
import { useControlStyles } from '../useControlStyles';

export const ArenaBackgroundEdit: React.FC = () => {
    const classes = useControlStyles();
    const { scene, dispatch } = useScene();
    const { t } = useTranslation();
    return (
        <div className={classes.column}>
            <Divider className={classes.divider} style={{ marginBottom: '-12px' }}>
                {t('arena.groupImage')}
            </Divider>
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
        </div>
    );
};
