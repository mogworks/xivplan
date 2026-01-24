import { Field, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompactColorPicker } from '../../CompactColorPicker';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { AoeProps } from '../../lib/aoe/aoeProps';
import { isAoeObject } from '../../scene';
import {
    DEFAULT_AOE_COLOR,
    DEFAULT_AOE_INNER_GLOW_COLOR,
    DEFAULT_AOE_INNER_GLOW_OPACITY,
    DEFAULT_AOE_OPACITY,
    DEFAULT_AOE_OUTLINE_COLOR,
    DEFAULT_AOE_OUTLINE_OPACITY,
} from '../../theme';
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

export const AoeEffectControls: React.FC<PropertiesControlProps<AoeProps>> = ({ objects, className }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { dispatch } = useScene();

    if (!objects.every(isAoeObject)) {
        return null;
    }

    const baseColor = commonValue(objects, (o) => o.baseColor) ?? DEFAULT_AOE_COLOR;
    const baseOpacity = commonValue(objects, (o) => o.baseOpacity) ?? DEFAULT_AOE_OPACITY;
    const innerGlowColor = commonValue(objects, (o) => o.innerGlowColor) ?? DEFAULT_AOE_INNER_GLOW_COLOR;
    const innerGlowOpacity = commonValue(objects, (o) => o.innerGlowOpacity) ?? DEFAULT_AOE_INNER_GLOW_OPACITY;
    const outlineColor = commonValue(objects, (o) => o.outlineColor) ?? DEFAULT_AOE_OUTLINE_COLOR;
    const outlineOpacity = commonValue(objects, (o) => o.outlineOpacity) ?? DEFAULT_AOE_OUTLINE_OPACITY;

    const updateAoeProps = (patch: Partial<AoeProps>, transient = false) =>
        dispatch({
            type: 'update',
            value: objects.map((obj) => (isAoeObject(obj) ? { ...obj, ...patch } : obj)),
            transient,
        });

    return (
        <div className={mergeClasses(classes.grid, className)}>
            {/* 基底 */}
            <CompactColorPicker
                label={t('aoe.baseColor')}
                color={baseColor}
                onChange={(data) => updateAoeProps({ baseColor: data.value }, data.transient)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
            <Field label={t('aoe.baseOpacity')}>
                <SpinButton
                    value={baseOpacity}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(ev, data) => updateAoeProps({ baseOpacity: data.value ?? undefined })}
                />
            </Field>

            {/* 内发光 */}
            <CompactColorPicker
                label={t('aoe.innerGlowColor')}
                color={innerGlowColor}
                onChange={(data) => updateAoeProps({ innerGlowColor: data.value }, data.transient)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
            <Field label={t('aoe.innerGlowOpacity')}>
                <SpinButton
                    value={innerGlowOpacity}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(ev, data) => updateAoeProps({ innerGlowOpacity: data.value ?? undefined })}
                />
            </Field>

            {/* 外轮廓 */}
            <CompactColorPicker
                label={t('aoe.outlineColor')}
                color={outlineColor}
                onChange={(data) => updateAoeProps({ outlineColor: data.value }, data.transient)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
            <Field label={t('aoe.outlineOpacity')}>
                <SpinButton
                    value={outlineOpacity}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(ev, data) => updateAoeProps({ outlineOpacity: data.value ?? undefined })}
                />
            </Field>
        </div>
    );
};
