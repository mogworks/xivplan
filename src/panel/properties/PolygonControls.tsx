import { Field, makeStyles } from '@fluentui/react-components';
import { bundleIcon, SquareFilled, SquareRegular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { SpinButton } from '../../SpinButton';
import { MAX_POLYGON_SIDES, MIN_POLYGON_SIDES } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { PolygonOrientation, PolygonProps } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const Square = bundleIcon(SquareFilled, SquareRegular);

export const PolygonSidesControl: React.FC<PropertiesControlProps<PolygonProps>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const spokes = commonValue(objects, (obj) => obj.sides);

    const onSidesChanged = useSpinChanged((sides: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, sides })) }),
    );

    return (
        <Field label={t('properties.sides')} className={classes.cell}>
            <SpinButton
                value={spokes}
                onChange={onSidesChanged}
                min={MIN_POLYGON_SIDES}
                max={MAX_POLYGON_SIDES}
                step={1}
            />
        </Field>
    );
};

export const PolygonOrientationControl: React.FC<PropertiesControlProps<PolygonProps>> = ({ objects }) => {
    const classes = useStyles();
    const controlClasses = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const orient = commonValue(objects, (obj) => obj.orient);

    const handleChanged = (orient: PolygonOrientation) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, orient })) });

    return (
        <Field label={t('properties.orientation')} className={controlClasses.cell}>
            <SegmentedGroup
                name="player-count"
                value={orient ?? ''}
                onChange={(ev, data) => handleChanged(data.value as PolygonOrientation)}
            >
                <Segment value="side" icon={<Square />} title={t('properties.sideUp')} />
                <Segment value="point" icon={<Square className={classes.point} />} title={t('properties.pointUp')} />
            </SegmentedGroup>
        </Field>
    );
};

const useStyles = makeStyles({
    point: {
        transform: 'rotate(45deg)',
    },
});
