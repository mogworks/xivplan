import { Field } from '@fluentui/react-components';
import {
    SquareHintFilled,
    SquareHintRegular,
    SquareShadowFilled,
    SquareShadowRegular,
    TextAlignCenterFilled,
    TextAlignCenterRegular,
    TextAlignLeftFilled,
    TextAlignLeftRegular,
    TextAlignRightFilled,
    TextAlignRightRegular,
    TextEffectsFilled,
    TextEffectsRegular,
    bundleIcon,
} from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompactColorPicker } from '../../CompactColorPicker';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';
import { DeferredTextarea } from '../../DeferredTextarea';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { SpinButton } from '../../SpinButton';
import { MIN_FONT_SIZE } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { TextObject, TextStyle } from '../../scene';
import {
    COLOR_BLACK,
    COLOR_BLUE,
    COLOR_GREEN,
    COLOR_RED,
    COLOR_WHITE,
    COLOR_YELLOW,
    makeColorSwatch,
    useSceneTheme,
} from '../../theme';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const AlignLeft = bundleIcon(TextAlignLeftFilled, TextAlignLeftRegular);
const AlignCenter = bundleIcon(TextAlignCenterFilled, TextAlignCenterRegular);
const AlignRight = bundleIcon(TextAlignRightFilled, TextAlignRightRegular);

const TextEffects = bundleIcon(TextEffectsFilled, TextEffectsRegular);
const SquareShadow = bundleIcon(SquareShadowFilled, SquareShadowRegular);
const SquareHint = bundleIcon(SquareHintFilled, SquareHintRegular);

export const TextOutlineControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const { t } = useTranslation();
    const theme = useSceneTheme();
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const stroke = commonValue(objects, (obj) => obj.stroke);
    const style = commonValue(objects, (obj) => obj.style);

    const handleStrokeChanged = (stroke: string, transient: boolean) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, stroke })), transient });

    const handleStyleChanged = (style: TextStyle) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, style })) });

    const swatches = [
        makeColorSwatch(COLOR_RED, t('colors.red')),
        makeColorSwatch(COLOR_YELLOW, t('colors.yellow')),
        makeColorSwatch(COLOR_GREEN, t('colors.green')),
        makeColorSwatch(COLOR_BLUE, t('colors.blue')),
        makeColorSwatch(COLOR_WHITE, t('colors.white')),
        makeColorSwatch(COLOR_BLACK, t('colors.black')),
        makeColorSwatch(theme.colorArena, t('colors.arena')),
        makeColorSwatch(theme.colorBackground, t('colors.background')),
    ];

    const disabled = style === 'plain';

    return (
        <>
            <div className={classes.row}>
                <CompactColorPicker
                    label={t('text.outline')}
                    color={stroke ?? ''}
                    className={classes.grow}
                    disabled={disabled}
                    onChange={(data) => handleStrokeChanged(data.value, data.transient)}
                    onCommit={() => dispatch({ type: 'commit' })}
                />
                <Field label={t('text.style')}>
                    <SegmentedGroup
                        name="text-style"
                        value={style}
                        onChange={(ev, data) => handleStyleChanged(data.value as TextStyle)}
                    >
                        <Segment value="outline" icon={<TextEffects />} title={t('text.outline')} />
                        <Segment value="shadow" icon={<SquareShadow />} title={t('text.shadow')} />
                        <Segment value="plain" icon={<SquareHint />} title={t('text.noOutline')} />
                    </SegmentedGroup>
                </Field>
            </div>
            {!disabled && (
                <div className={classes.row}>
                    <CompactSwatchColorPicker
                        swatches={swatches}
                        selectedValue={stroke ?? ''}
                        onSelectionChange={(ev, data) => handleStrokeChanged(data.selectedSwatch, false)}
                    />
                </div>
            )}
        </>
    );
};

export const TextLayoutControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const { t } = useTranslation();
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const fontSize = commonValue(objects, (obj) => obj.fontSize);
    const align = commonValue(objects, (obj) => obj.align);

    const onFontSizeChanged = useSpinChanged((fontSize: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, fontSize })) }),
    );

    const onAlignChanged = (align: string) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, align })) });

    return (
        <div className={classes.row}>
            <Field label={t('text.fontSize')}>
                <SpinButton value={fontSize} onChange={onFontSizeChanged} min={MIN_FONT_SIZE} step={5} />
            </Field>
            <Field label={t('text.align')}>
                <SegmentedGroup name="text-align" value={align} onChange={(ev, data) => onAlignChanged(data.value)}>
                    <Segment value="left" icon={<AlignLeft />} title={t('text.alignLeft')} />
                    <Segment value="center" icon={<AlignCenter />} title={t('text.alignCenter')} />
                    <Segment value="right" icon={<AlignRight />} title={t('text.alignRight')} />
                </SegmentedGroup>
            </Field>
        </div>
    );
};

export const TextValueControl: React.FC<PropertiesControlProps<TextObject>> = ({ objects }) => {
    const { t } = useTranslation();
    const { dispatch } = useScene();

    const text = commonValue(objects, (obj) => obj.text);

    const setText = (text: string) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, text })), transient: true });

    // TODO: add autoAdjustHeight once implemented
    return (
        <Field label={t('text.text')}>
            <DeferredTextarea
                resize="vertical"
                rows={3}
                value={text ?? ''}
                onChange={(ev, data) => setText(data.value)}
                onCommit={() => dispatch({ type: 'commit' })}
            />
        </Field>
    );
};
