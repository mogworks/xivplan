import { Field } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { CompactColorPicker } from '../CompactColorPicker';
import { CompactSwatchColorPicker } from '../CompactSwatchColorPicker';
import { OpacitySlider } from '../OpacitySlider';
import { useSpinChanged } from '../prefabs/useSpinChanged';
import { usePadding, useScene } from '../SceneProvider';
import { SpinButton } from '../SpinButton';
import { useColorSwatches, useSceneTheme } from '../theme';
import { useControlStyles } from '../useControlStyles';

export const ArenaBackgroundEdit: React.FC = () => {
    const theme = useSceneTheme();
    const classes = useControlStyles();
    const colorSwatches = useColorSwatches();
    const { t } = useTranslation();

    const { scene, dispatch } = useScene();
    const { background } = scene.arena;
    const padding = usePadding();

    const onPaddingTopChanged = useSpinChanged((value) =>
        dispatch({ type: 'arenaBackgroundPadding', value: { ...padding, top: value } }),
    );
    const onPaddingBottomChanged = useSpinChanged((value) =>
        dispatch({ type: 'arenaBackgroundPadding', value: { ...padding, bottom: value } }),
    );
    const onPaddingLeftChanged = useSpinChanged((value) =>
        dispatch({ type: 'arenaBackgroundPadding', value: { ...padding, left: value } }),
    );
    const onPaddingRightChanged = useSpinChanged((value) =>
        dispatch({ type: 'arenaBackgroundPadding', value: { ...padding, right: value } }),
    );

    return (
        <div className={classes.column}>
            <CompactColorPicker
                label={t('arena.background.color')}
                color={background?.color ?? theme.colorBackground}
                onChange={(data) => dispatch({ type: 'arenaBackgroundColor', value: data.value })}
            />
            <CompactSwatchColorPicker
                swatches={colorSwatches}
                selectedValue={background?.color ?? theme.colorBackground}
                onSelectionChange={(_, data) => dispatch({ type: 'arenaBackgroundColor', value: data.selectedSwatch })}
            />
            <OpacitySlider
                label={t('arena.background.opacity')}
                value={background?.opacity ?? 0}
                onChange={(_, data) => {
                    dispatch({
                        type: 'arenaBackgroundOpacity',
                        value: data.value,
                        transient: data.transient,
                    });
                }}
                onCommit={() => dispatch({ type: 'commit' })}
            />
            <div className={classes.row}>
                <Field label={t('arena.background.paddingTop')}>
                    <SpinButton min={0} max={500} step={10} value={padding.top} onChange={onPaddingTopChanged} />
                </Field>
                <Field label={t('arena.background.paddingBottom')}>
                    <SpinButton min={0} max={500} step={10} value={padding.bottom} onChange={onPaddingBottomChanged} />
                </Field>
            </div>
            <div className={classes.row}>
                <Field label={t('arena.background.paddingLeft')}>
                    <SpinButton min={0} max={500} step={10} value={padding.left} onChange={onPaddingLeftChanged} />
                </Field>
                <Field label={t('arena.background.paddingRight')}>
                    <SpinButton min={0} max={500} step={10} value={padding.right} onChange={onPaddingRightChanged} />
                </Field>
            </div>
        </div>
    );
};
