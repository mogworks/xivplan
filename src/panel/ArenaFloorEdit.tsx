import { Field } from '@fluentui/react-components';
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
import { CompactSwatchColorPicker } from '../CompactSwatchColorPicker';
import { OpacitySlider } from '../OpacitySlider';
import { useFloor, useScene } from '../SceneProvider';
import { Segment, SegmentedGroup } from '../Segmented';
import { SpinButton } from '../SpinButton';
import { useSpinChanged } from '../prefabs/useSpinChanged';
import { FloorShape } from '../scene';
import { useColorSwatches, useSceneTheme } from '../theme';
import { useControlStyles } from '../useControlStyles';

const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const SquareIcon = bundleIcon(SquareFilled, SquareRegular);
const BorderNoneIcon = bundleIcon(BorderNoneFilled, BorderNoneRegular);

export const ArenaFloorEdit: React.FC = () => {
    const theme = useSceneTheme();
    const colorSwatches = useColorSwatches();
    const classes = useControlStyles();
    const { t } = useTranslation();
    const { dispatch } = useScene();
    const floor = useFloor();

    const { shape, color, opacity, width, height } = floor;

    const onWidthChanged = useSpinChanged((value) => dispatch({ type: 'arenaFloorWidth', value }));
    const onHeightChanged = useSpinChanged((value) => dispatch({ type: 'arenaFloorHeight', value }));

    return (
        <div className={classes.column}>
            <div className={classes.row}>
                <Field label={t('arena.floor.shape')}>
                    <SegmentedGroup
                        style={{ height: '32px' }}
                        name="arena-shape"
                        value={shape}
                        onChange={(_, data) => dispatch({ type: 'arenaFloorShape', value: data.value as FloorShape })}
                    >
                        <Segment value={FloorShape.None} icon={<BorderNoneIcon />} title={t('arena.floor.none')} />
                        <Segment value={FloorShape.Circle} icon={<CircleIcon />} title={t('arena.floor.circle')} />
                        <Segment
                            value={FloorShape.Rectangle}
                            icon={<SquareIcon />}
                            title={t('arena.floor.rectangle')}
                        />
                    </SegmentedGroup>
                </Field>
            </div>
            {shape !== FloorShape.None && (
                <>
                    <CompactColorPicker
                        label={t('arena.floor.color')}
                        color={color ?? theme.colorArena}
                        onChange={(data) => dispatch({ type: 'arenaFloorColor', value: data.value })}
                        onCommit={() => dispatch({ type: 'commit' })}
                    />
                    <CompactSwatchColorPicker
                        swatches={colorSwatches}
                        selectedValue={color ?? theme.colorArena}
                        onSelectionChange={(_, data) =>
                            dispatch({ type: 'arenaFloorColor', value: data.selectedSwatch })
                        }
                    />
                    <OpacitySlider
                        label={t('arena.floor.opacity')}
                        value={opacity ?? 100}
                        onChange={(_, data) => {
                            dispatch({
                                type: 'arenaFloorOpacity',
                                value: data.value,
                                transient: data.transient,
                            });
                        }}
                        onCommit={() => dispatch({ type: 'commit' })}
                    />
                </>
            )}
            <div className={classes.row}>
                <Field label={t('arena.floor.width')}>
                    <SpinButton min={50} max={2000} step={50} value={width} onChange={onWidthChanged} />
                </Field>
                <Field label={t('arena.floor.height')}>
                    <SpinButton min={50} max={2000} step={50} value={height} onChange={onHeightChanged} />
                </Field>
            </div>
        </div>
    );
};
