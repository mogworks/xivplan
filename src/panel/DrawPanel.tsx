import {
    Field,
    ToggleButton,
    ToggleButtonProps,
    makeStyles,
    mergeClasses,
    shorthands,
    tokens,
} from '@fluentui/react-components';
import {
    CursorClickFilled,
    CursorClickRegular,
    DrawImageFilled,
    DrawImageRegular,
    bundleIcon,
} from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BrushSizeControl } from '../BrushSizeControl';
import { CompactColorPicker, CompactColorPickerProps } from '../CompactColorPicker';
import { CompactSwatchColorPicker } from '../CompactSwatchColorPicker';
import { OpacitySlider } from '../OpacitySlider';
import { EditMode } from '../editMode';
import { MarkerArrow } from '../prefabs/Arrow';
import {
    BoardIconArrowPrefab,
    BoardIconCirclePrefab,
    BoardIconCrossPrefab,
    BoardIconRotationPrefab,
    BoardIconSquarePrefab,
    BoardIconTrianglePrefab,
} from '../prefabs/BoardIcon';
import '../prefabs/DrawObjectRenderer';
import { TextLabel } from '../prefabs/TextLabel';
import { useSpinChanged } from '../prefabs/useSpinChanged';
import { ZoneArc } from '../prefabs/zone/ZoneArc';
import { ZoneCircle } from '../prefabs/zone/ZoneCircle';
import { ZoneDonut } from '../prefabs/zone/ZoneDonut';
import { ZoneFan } from '../prefabs/zone/ZoneFan';
import { ZoneLine } from '../prefabs/zone/ZoneLine';
import { ZonePolygon } from '../prefabs/zone/ZonePolygon';
import { ZoneRectangle } from '../prefabs/zone/ZoneRectangle';
import { ZoneRightTriangle } from '../prefabs/zone/ZoneRightTriangle';
import { ZoneStarburst } from '../prefabs/zone/ZoneStarburst';
import { ZoneTriangle } from '../prefabs/zone/ZoneTriangle';
import { useColorSwatches } from '../theme';
import { useControlStyles } from '../useControlStyles';
import { useDrawConfig } from '../useDrawConfig';
import { useEditMode } from '../useEditMode';
import { useHotkeys } from '../useHotkeys';
import { ObjectGroup, Section } from './Section';

const CursorClick = bundleIcon(CursorClickFilled, CursorClickRegular);
const DrawImage = bundleIcon(DrawImageFilled, DrawImageRegular);

type ToolButtonPropsGetter = (mode: EditMode) => ToggleButtonProps;

export const DrawPanel: React.FC = () => {
    const classes = useStyles();
    const controlClasses = useControlStyles();
    const colorSwatches = useColorSwatches();
    const [editMode, setEditMode] = useEditMode();
    const [config, setConfig] = useDrawConfig();
    const { t } = useTranslation();

    const setColor: CompactColorPickerProps['onChange'] = (data) => setConfig({ ...config, color: data.value });

    const setOpacity = (opacity: number) => {
        if (opacity !== config.opacity) {
            setConfig({ ...config, opacity });
        }
    };

    const onSizeChanged = useSpinChanged((brushSize: number) => setConfig({ ...config, brushSize }));

    const modeHotkey = (mode: EditMode) => (e: KeyboardEvent) => {
        setEditMode(mode);
        e.preventDefault();
    };

    useHotkeys('e', {}, modeHotkey(EditMode.Normal), [editMode]);
    useHotkeys('d', {}, modeHotkey(EditMode.Draw), [editMode]);

    const getToolButtonProps: ToolButtonPropsGetter = (mode) => {
        const checked = editMode === mode;
        return {
            checked,
            className: mergeClasses(classes.button, checked && classes.checked),
            onClick: () => setEditMode(mode),
        };
    };

    return (
        <div className={mergeClasses(controlClasses.panel, controlClasses.column)}>
            <Section title={t('draw.tools')}>
                <ObjectGroup>
                    <TextLabel />
                    <MarkerArrow />
                </ObjectGroup>
                <ObjectGroup>
                    <BoardIconCirclePrefab />
                    <BoardIconCrossPrefab />
                    <BoardIconTrianglePrefab />
                    <BoardIconSquarePrefab />
                    <BoardIconArrowPrefab />
                    <BoardIconRotationPrefab />
                </ObjectGroup>
            </Section>
            <Section title={t('draw.shape')}>
                <ObjectGroup>
                    <ZoneRectangle />
                    <ZoneLine />
                    <ZoneCircle />
                    <ZoneDonut />
                    <ZoneFan />
                    <ZoneArc />
                </ObjectGroup>
                <ObjectGroup>
                    <ZoneTriangle />
                    <ZoneRightTriangle />
                    <ZonePolygon />
                    <ZoneStarburst />
                </ObjectGroup>
            </Section>
            <Section title={t('draw.brush')}>
                <Field label={t('draw.tool')}>
                    <div className={classes.wrapper}>
                        <ToggleButton size="large" icon={<CursorClick />} {...getToolButtonProps(EditMode.Normal)}>
                            {t('draw.edit')}
                        </ToggleButton>
                        <ToggleButton size="large" icon={<DrawImage />} {...getToolButtonProps(EditMode.Draw)}>
                            {t('draw.draw')}
                        </ToggleButton>
                    </div>
                </Field>
                <CompactColorPicker
                    label={t('draw.color')}
                    placeholder={t('draw.brushColor')}
                    color={config.color}
                    onChange={setColor}
                />
                <CompactSwatchColorPicker
                    swatches={colorSwatches}
                    selectedValue={config.color}
                    onSelectionChange={(ev, data) => setColor({ value: data.selectedSwatch, transient: false })}
                />
                <OpacitySlider
                    label={t('draw.opacity')}
                    value={config.opacity}
                    onChange={(ev, data) => setOpacity(data.value)}
                />
                <BrushSizeControl
                    value={config.brushSize}
                    color={config.color}
                    opacity={config.opacity}
                    onChange={onSizeChanged}
                />
            </Section>
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: {
        display: 'flex',
        flexFlow: 'row',
        gap: tokens.spacingHorizontalS,
    },
    button: {
        flex: 1,
    },
    checked: {
        ...shorthands.borderColor(tokens.colorCompoundBrandStroke),

        ':hover': {
            ...shorthands.borderColor(tokens.colorCompoundBrandStrokeHover),
        },

        ':hover:active': {
            ...shorthands.borderColor(tokens.colorCompoundBrandStrokePressed),
        },
    },
});
