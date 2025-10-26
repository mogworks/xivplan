import { Field } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { StackCountObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const STACK_VALUES = [1, 2, 3, 4];

export const StackCountControl: React.FC<PropertiesControlProps<StackCountObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const count = commonValue(objects, (obj) => obj.count);

    const handleChanged = (count: number) => {
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, count })) });
    };

    return (
        <Field label={t('properties.playerCount')} className={classes.cell}>
            <SegmentedGroup
                name="player-count"
                value={String(count)}
                onChange={(ev, data) => handleChanged(parseInt(data.value))}
            >
                {STACK_VALUES.map((i) => (
                    <Segment
                        key={i}
                        value={i.toString()}
                        icon={i.toString()}
                        size="mediumText"
                        title={getItemTitle(i, t)}
                    />
                ))}
            </SegmentedGroup>
        </Field>
    );
};

function getItemTitle(count: number, t: (key: string) => string) {
    switch (count) {
        case 1:
            return t('properties.onePlayer');
        case 2:
            return t('properties.twoPlayers');
        case 3:
            return t('properties.threePlayers');
        case 4:
            return t('properties.fourPlayers');
        default:
            return `${count}`;
    }
}
