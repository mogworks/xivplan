import { Divider, Field } from '@fluentui/react-components';
import {
    BorderNoneFilled,
    BorderNoneRegular,
    CircleFilled,
    CircleRegular,
    SquareFilled,
    SquareRegular,
    bundleIcon,
} from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompactColorPicker } from '../CompactColorPicker';
import { useScene } from '../SceneProvider';
import { Segment, SegmentedGroup } from '../Segmented';
import { SpinButton } from '../SpinButton';
import { useSpinChanged } from '../prefabs/useSpinChanged';
import { ArenaShape } from '../scene';
import { useSceneTheme } from '../theme';
import { useControlStyles } from '../useControlStyles';

const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const SquareIcon = bundleIcon(SquareFilled, SquareRegular);
const BorderNoneIcon = bundleIcon(BorderNoneFilled, BorderNoneRegular);

export const ArenaShapeEdit: React.FC = () => {
    const classes = useControlStyles();
    const theme = useSceneTheme();
    const { scene, dispatch } = useScene();
    const { shape, color, width, height, padding, paddingX: px, paddingY: py } = scene.arena;
    const paddingX = px ?? padding;
    const paddingY = py ?? padding;
    const { t } = useTranslation();

    const onWidthChanged = useSpinChanged((value) => dispatch({ type: 'arenaWidth', value }));
    const onHeightChanged = useSpinChanged((value) => dispatch({ type: 'arenaHeight', value }));
    const onPaddingXChanged = useSpinChanged((value) => dispatch({ type: 'arenaPaddingX', value }));
    const onPaddingYChanged = useSpinChanged((value) => dispatch({ type: 'arenaPaddingY', value }));

    return (
        <div className={classes.column}>
            <Divider className={classes.divider} style={{ marginBottom: '-12px' }}>
                {t('arena.groupBase')}
            </Divider>
            <div className={classes.row}>
                <Field label={t('arena.shape')} className={classes.cell}>
                    <SegmentedGroup
                        name="arena-shape"
                        value={shape}
                        onChange={(ev, data) => dispatch({ type: 'arenaShape', value: data.value as ArenaShape })}
                    >
                        <Segment value={ArenaShape.None} icon={<BorderNoneIcon />} title={t('arena.none')} />
                        <Segment value={ArenaShape.Circle} icon={<CircleIcon />} title={t('arena.circle')} />
                        <Segment value={ArenaShape.Rectangle} icon={<SquareIcon />} title={t('arena.rectangle')} />
                    </SegmentedGroup>
                </Field>
                {shape !== ArenaShape.None && (
                    <CompactColorPicker
                        className={classes.cell}
                        label={t('arena.color')}
                        color={color ?? theme.colorArena}
                        onChange={(data) => dispatch({ type: 'arenaColor', value: data.value })}
                        onCommit={() => dispatch({ type: 'commit' })}
                    />
                )}
            </div>
            <div className={classes.row}>
                <Field label={t('arena.paddingX')}>
                    <SpinButton min={0} max={500} step={10} value={paddingX} onChange={onPaddingXChanged} />
                </Field>
                <Field label={t('arena.paddingY')}>
                    <SpinButton min={0} max={500} step={10} value={paddingY} onChange={onPaddingYChanged} />
                </Field>
            </div>
            <div className={classes.row}>
                <Field label={t('properties.width')}>
                    <SpinButton min={50} max={2000} step={50} value={width} onChange={onWidthChanged} />
                </Field>
                <Field label={t('properties.height')}>
                    <SpinButton min={50} max={2000} step={50} value={height} onChange={onHeightChanged} />
                </Field>
            </div>
        </div>
    );
};
