import { Button, Image, Label, makeStyles, tokens } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { getPartyIconUrl, PartyIcons } from '../../prefabs/partyIcon';
import { PartyObject } from '../../scene';
import { PropertiesControlProps } from '../PropertiesControl';

const icons = [
    [PartyIcons.Any, PartyIcons.AllRole, PartyIcons.Support],
    [PartyIcons.Tank1, PartyIcons.Tank2],
    [PartyIcons.Tank],
    [PartyIcons.PLD, PartyIcons.WAR, PartyIcons.DRK, PartyIcons.GNB],
    [PartyIcons.GLA, PartyIcons.MRD],
    [PartyIcons.Healer1, PartyIcons.Healer2],
    [PartyIcons.Healer, PartyIcons.PureHealer, PartyIcons.BarrierHealer],
    [PartyIcons.WHM, PartyIcons.SCH, PartyIcons.AST, PartyIcons.SGE],
    [PartyIcons.CNJ],
    [PartyIcons.Melee1, PartyIcons.Melee2, PartyIcons.Ranged1, PartyIcons.Ranged2],
    [PartyIcons.DPS, PartyIcons.Melee, PartyIcons.Ranged, PartyIcons.PhysicalRanged, PartyIcons.MagicalRanged],
    [PartyIcons.MNK, PartyIcons.DRG, PartyIcons.NIN, PartyIcons.SAM, PartyIcons.RPR, PartyIcons.VPR],
    [PartyIcons.BRD, PartyIcons.MCH, PartyIcons.DNC],
    [PartyIcons.BLM, PartyIcons.SMN, PartyIcons.RDM, PartyIcons.PCT, PartyIcons.BLU],
    [PartyIcons.PGL, PartyIcons.LNC, PartyIcons.ARC, PartyIcons.THM, PartyIcons.ACN],
];

export const PartyIconControl: React.FC<PropertiesControlProps<PartyObject>> = ({ objects }) => {
    const classes = useStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();

    const onClick = (iconId: number) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, iconId })) });

    return (
        <div>
            <Label className={classes.label}>{t('properties.variant')}</Label>
            <div className={classes.container}>
                {icons.map((row, i) => (
                    <div key={i} className={classes.row}>
                        {row.map((iconId, j) => {
                            const icon = getPartyIconUrl(iconId);
                            const name = t(`boardIcon.${iconId}`, { defaultValue: import.meta.env.DEV ? iconId : '' });
                            return (
                                <Button
                                    key={j}
                                    appearance="transparent"
                                    title={name}
                                    icon={<Image src={icon} width={32} height={32} />}
                                    onClick={() => onClick(iconId)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const useStyles = makeStyles({
    label: {
        display: 'block',
        paddingTop: tokens.spacingVerticalXXS,
        paddingBottom: tokens.spacingVerticalXXS,
        marginBottom: tokens.spacingVerticalXXS,
    },

    container: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalXS,
    },

    row: {
        display: 'flex',
        flexFlow: 'row',
        gap: tokens.spacingHorizontalXS,
    },
});
