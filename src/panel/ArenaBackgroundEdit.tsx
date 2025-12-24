import { Divider, Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeferredInput } from '../DeferredInput';
import { OpacitySlider } from '../OpacitySlider';
import { useSpinChanged } from '../prefabs/useSpinChanged';
import { useScene } from '../SceneProvider';
import { SpinButton } from '../SpinButton';
import { useControlStyles } from '../useControlStyles';

export const ArenaBackgroundEdit: React.FC = () => {
    const classes = useControlStyles();
    const { scene, dispatch } = useScene();
    const { width, height, background } = scene.arena;
    const { t } = useTranslation();

    const onWidthChanged = useSpinChanged((value) => dispatch({ type: 'arenaBackgroundWidth', value }));
    const onHeightChanged = useSpinChanged((value) => dispatch({ type: 'arenaBackgroundHeight', value }));

    return (
        <div className={classes.column}>
            <Divider className={classes.divider} style={{ marginBottom: '-12px' }}>
                {t('arena.groupImage')}
            </Divider>
            <Field label={t('arena.backgroundImageUrl')}>
                <DeferredInput
                    value={background?.url}
                    onChange={(ev, data) => {
                        dispatch({
                            type: 'arenaBackgroundUrl',
                            value: data.value,
                            transient: true,
                        });
                    }}
                    onCommit={() => dispatch({ type: 'commit' })}
                />
            </Field>
            {background?.url && (
                <>
                    <OpacitySlider
                        label={t('arena.backgroundImageOpacity')}
                        value={background?.opacity ?? 100}
                        onChange={(ev, data) => {
                            dispatch({
                                type: 'arenaBackgroundOpacity',
                                value: data.value,
                                transient: data.transient,
                            });
                        }}
                        onCommit={() => dispatch({ type: 'commit' })}
                    />
                    <div className={classes.row}>
                        <Field label={t('arena.backgroundWidth')}>
                            <SpinButton
                                min={50}
                                max={2000}
                                step={50}
                                value={background?.width ?? width}
                                onChange={onWidthChanged}
                            />
                        </Field>
                        <Field label={t('arena.backgroundHeight')}>
                            <SpinButton
                                min={50}
                                max={2000}
                                step={50}
                                value={background?.height ?? height}
                                onChange={onHeightChanged}
                            />
                        </Field>
                    </div>
                </>
            )}
        </div>
    );
};
