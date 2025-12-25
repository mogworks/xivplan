import { Field, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompactColorPicker } from '../../CompactColorPicker';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { shouldUseNativeStyleControls } from '../../lib/aoe/nativeStyleSupport';
import { ZoneStyleObject, supportsNativeStyle } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const useStyles = makeStyles({
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingHorizontalS,
    },

    fullRow: {
        gridColumn: '1 / -1',
    },

    row: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
});

export const AoeEffectControls: React.FC<PropertiesControlProps<ZoneStyleObject>> = ({ objects, className }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { dispatch } = useScene();

    // 仅当所有选中对象都支持原生样式，且至少一个对象为 native 变体时显示
    if (!shouldUseNativeStyleControls(objects)) {
        return null;
    }

    const baseColor = commonValue(objects, (o) => o.baseColor) ?? '#fb923c';
    const baseOpacity = commonValue(objects, (o) => o.baseOpacity) ?? 12;
    const innerGlowColor = commonValue(objects, (o) => o.innerGlowColor) ?? '#ff751f';
    const innerGlowOpacity = commonValue(objects, (o) => o.innerGlowOpacity) ?? 100;
    const outlineColor = commonValue(objects, (o) => o.outlineColor) ?? '#fffc79';
    const outlineOpacity = commonValue(objects, (o) => o.outlineOpacity) ?? 100;

    const updateStyle = (patch: Partial<ZoneStyleObject>, transient = false) =>
        dispatch({
            type: 'update',
            value: objects.map((obj) => (supportsNativeStyle(obj) ? { ...obj, ...patch } : obj)),
            transient,
        });

    return (
        <div className={mergeClasses(classes.grid, className)}>
            {/* 注意：整体透明度由 PropertiesPanel 的 AoeGlobalOpacityControl 负责，这里不再重复显示 */}

            {/* 基底 */}
            <CompactColorPicker
                label={t('aoe.baseColor')}
                color={baseColor}
                onChange={(data) => updateStyle({ baseColor: data.value }, data.transient)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
            <Field label={t('aoe.baseOpacity')}>
                <SpinButton
                    value={baseOpacity}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(ev, data) => updateStyle({ baseOpacity: data.value ?? undefined })}
                />
            </Field>

            {/* 内发光 */}
            <CompactColorPicker
                label={t('aoe.innerGlowColor')}
                color={innerGlowColor}
                onChange={(data) => updateStyle({ innerGlowColor: data.value }, data.transient)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
            <Field label={t('aoe.innerGlowOpacity')}>
                <SpinButton
                    value={innerGlowOpacity}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(ev, data) => updateStyle({ innerGlowOpacity: data.value ?? undefined })}
                />
            </Field>

            {/* 外轮廓 */}
            <CompactColorPicker
                label={t('aoe.outlineColor')}
                color={outlineColor}
                onChange={(data) => updateStyle({ outlineColor: data.value }, data.transient)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
            <Field label={t('aoe.outlineOpacity')}>
                <SpinButton
                    value={outlineOpacity}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(ev, data) => updateStyle({ outlineOpacity: data.value ?? undefined })}
                />
            </Field>
        </div>
    );
};
