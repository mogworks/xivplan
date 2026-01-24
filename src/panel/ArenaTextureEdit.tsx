import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeferredInput } from '../DeferredInput';
import { OpacitySlider } from '../OpacitySlider';
import { useSpinChanged } from '../prefabs/useSpinChanged';
import { useFloor, useScene } from '../SceneProvider';
import { SpinButton } from '../SpinButton';
import { useControlStyles } from '../useControlStyles';

export const ArenaTextureEdit: React.FC = () => {
    const classes = useControlStyles();
    const { t } = useTranslation();
    const { scene, dispatch } = useScene();
    const floor = useFloor();
    const { url, opacity, offsetX, offsetY, width, height } = scene.arena.texture ?? {};

    const onOffsetXChanged = useSpinChanged((value) => dispatch({ type: 'arenaTextureOffsetX', value }));
    const onOffsetYChanged = useSpinChanged((value) => dispatch({ type: 'arenaTextureOffsetY', value }));
    const onWidthChanged = useSpinChanged((value) => dispatch({ type: 'arenaTextureWidth', value }));
    const onHeightChanged = useSpinChanged((value) => dispatch({ type: 'arenaTextureHeight', value }));

    return (
        <div className={classes.column}>
            <Field label={t('arena.texture.url')}>
                <DeferredInput
                    value={url ?? ''}
                    onChange={(_, data) => {
                        dispatch({
                            type: 'arenaTextureUrl',
                            value: data.value,
                            transient: true,
                        });
                    }}
                    onCommit={() => dispatch({ type: 'commit' })}
                />
            </Field>
            {url && (
                <>
                    <OpacitySlider
                        label={t('arena.texture.opacity')}
                        value={opacity ?? 100}
                        onChange={(_, data) => {
                            dispatch({
                                type: 'arenaTextureOpacity',
                                value: data.value,
                                transient: data.transient,
                            });
                        }}
                        onCommit={() => dispatch({ type: 'commit' })}
                    />
                    <div className={classes.row}>
                        <Field label={t('arena.texture.offsetX')}>
                            <SpinButton
                                min={-1000}
                                max={1000}
                                step={5}
                                value={offsetX ?? 0}
                                onChange={onOffsetXChanged}
                            />
                        </Field>
                        <Field label={t('arena.texture.offsetY')}>
                            <SpinButton
                                min={-1000}
                                max={1000}
                                step={5}
                                value={offsetY ?? 0}
                                onChange={onOffsetYChanged}
                            />
                        </Field>
                    </div>
                    <div className={classes.row}>
                        <Field label={t('arena.texture.width')}>
                            <SpinButton
                                min={50}
                                max={2000}
                                step={50}
                                value={width ?? floor.width}
                                onChange={onWidthChanged}
                            />
                        </Field>
                        <Field label={t('arena.texture.height')}>
                            <SpinButton
                                min={50}
                                max={2000}
                                step={50}
                                value={height ?? floor.height}
                                onChange={onHeightChanged}
                            />
                        </Field>
                    </div>
                </>
            )}
        </div>
    );
};
