import { Divider, Field } from '@fluentui/react-components';
import {
    bundleIcon,
    CircleFilled,
    CircleRegular,
    SquareFilled,
    SquareHintFilled,
    SquareHintRegular,
    SquareRegular,
} from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_RADIAL_TICKS, DEFAULT_RECT_TICKS, NO_TICKS, Ticks, TickType } from '../scene';
import { useScene } from '../SceneProvider';
import { Segment, SegmentedGroup } from '../Segmented';
import { SpinButton } from '../SpinButton';
import { SpinButtonUnits } from '../SpinButtonUnits';
import { useControlStyles } from '../useControlStyles';

const SquareHintIcon = bundleIcon(SquareHintFilled, SquareHintRegular);
const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const SquareIcon = bundleIcon(SquareFilled, SquareRegular);

export const ArenaTickEdit: React.FC = () => {
    const classes = useControlStyles();
    const { scene, dispatch } = useScene();
    const ticks = scene.arena.ticks;
    const { t } = useTranslation();

    const setTicks = (ticks: Ticks) => {
        dispatch({ type: 'arenaTicks', value: ticks });
    };

    const onTypeChange = (option?: TickType) => {
        switch (option) {
            case TickType.None:
                setTicks(NO_TICKS);
                break;

            case TickType.Radial:
                setTicks(DEFAULT_RADIAL_TICKS);
                break;

            case TickType.Rectangular:
                setTicks(DEFAULT_RECT_TICKS);
                break;
        }
    };

    return (
        <div className={classes.column}>
            <Divider className={classes.divider} style={{ marginBottom: '-12px' }}>
                {t('arena.groupBorderTick')}
            </Divider>
            <Field label={t('arena.borderTickType')}>
                <SegmentedGroup
                    name="arena-ticks"
                    value={ticks?.type ?? TickType.None}
                    onChange={(ev, data) => onTypeChange(data.value as TickType)}
                >
                    <Segment value={TickType.None} icon={<SquareHintIcon />} title={t('arena.none')} />
                    <Segment value={TickType.Radial} icon={<CircleIcon />} title={t('arena.circle')} />
                    <Segment value={TickType.Rectangular} icon={<SquareIcon />} title={t('arena.rectangle')} />
                </SegmentedGroup>
            </Field>
            {ticks?.type === TickType.Radial && (
                <>
                    <div className={classes.row}>
                        <Field label={t('arena.majorTicks')}>
                            <SpinButton
                                min={0}
                                max={90}
                                step={1}
                                value={ticks.majorCount}
                                onChange={(ev, data) => {
                                    if (typeof data.value === 'number') {
                                        setTicks({ ...ticks, majorCount: data.value });
                                    }
                                }}
                            />
                        </Field>
                        <Field label={t('arena.majorRotation')}>
                            <SpinButtonUnits
                                min={-180}
                                max={180}
                                step={5}
                                fractionDigits={1}
                                suffix="°"
                                value={ticks.majorStart}
                                onChange={(ev, data) => {
                                    if (typeof data.value === 'number') {
                                        setTicks({ ...ticks, majorStart: data.value });
                                    }
                                }}
                            />
                        </Field>
                    </div>
                    <div className={classes.row}>
                        <Field label={t('arena.minorTicks')}>
                            <SpinButton
                                min={0}
                                max={180}
                                step={1}
                                value={ticks.minorCount}
                                onChange={(ev, data) => {
                                    if (typeof data.value === 'number') {
                                        setTicks({ ...ticks, minorCount: data.value });
                                    }
                                }}
                            />
                        </Field>
                        <Field label={t('arena.minorRotation')}>
                            <SpinButtonUnits
                                min={-180}
                                max={180}
                                step={5}
                                fractionDigits={1}
                                suffix="°"
                                value={ticks.minorStart}
                                onChange={(ev, data) => {
                                    if (typeof data.value === 'number') {
                                        setTicks({ ...ticks, minorStart: data.value });
                                    }
                                }}
                            />
                        </Field>
                    </div>
                </>
            )}
            {ticks?.type === TickType.Rectangular && (
                <>
                    <div className={classes.row}>
                        <Field label={t('arena.columns')}>
                            <SpinButton
                                min={1}
                                max={100}
                                step={1}
                                value={ticks.columns}
                                onChange={(ev, data) => {
                                    if (data.value) {
                                        setTicks({ ...ticks, columns: data.value });
                                    }
                                }}
                            />
                        </Field>
                        <Field label={t('arena.rows')}>
                            <SpinButton
                                min={1}
                                max={100}
                                step={1}
                                value={ticks.rows}
                                onChange={(ev, data) => {
                                    if (data.value) {
                                        setTicks({ ...ticks, rows: data.value });
                                    }
                                }}
                            />
                        </Field>
                    </div>
                </>
            )}
            {ticks && ticks.type !== TickType.None && <Divider />}
        </div>
    );
};
