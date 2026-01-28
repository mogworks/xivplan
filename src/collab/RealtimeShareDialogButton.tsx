import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Field,
    Image,
    Input,
    Label,
    makeStyles,
    Switch,
    Text,
    Toast,
    ToastTitle,
    tokens,
    useToastController,
} from '@fluentui/react-components';
import { CopyRegular, PeopleRegular } from '@fluentui/react-icons';
import React, { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsableToolbarButton } from '../CollapsableToolbarButton';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { getPartyIconUrl, PartyIcon, PartyIcons } from '../prefabs/partyIcon';
import { useCollaboration } from './CollaborationProvider';
import { getCollabLink } from './link';

export interface RealtimeShareDialogButtonProps {
    children?: ReactNode | undefined;
}

export const RealtimeShareDialogButton: React.FC<RealtimeShareDialogButtonProps> = ({ children }) => {
    return (
        <Dialog>
            <DialogTrigger>
                <CollapsableToolbarButton icon={<PeopleRegular />}>{children}</CollapsableToolbarButton>
            </DialogTrigger>
            <DialogSurface>
                <RealtimeShareDialogBody />
            </DialogSurface>
        </Dialog>
    );
};

const ICON_CHOICES: number[][] = [
    [PartyIcons.Any, PartyIcons.AllRole, PartyIcons.Tank, PartyIcons.Healer, PartyIcons.DPS],
    [PartyIcons.Melee, PartyIcons.Ranged, PartyIcons.PhysicalRanged, PartyIcons.MagicalRanged],
    [PartyIcon.PLD, PartyIcon.WAR, PartyIcon.DRK, PartyIcon.GNB],
    [PartyIcon.WHM, PartyIcon.SCH, PartyIcon.AST, PartyIcon.SGE],
    [PartyIcon.MNK, PartyIcon.DRG, PartyIcon.SAM, PartyIcon.RPR, PartyIcon.NIN, PartyIcon.VPR],
    [PartyIcon.BLM, PartyIcon.SMN, PartyIcon.RDM, PartyIcon.PCT, PartyIcon.BLU],
    [PartyIcon.BRD, PartyIcon.MCH, PartyIcon.DNC],
];

const RealtimeShareDialogBody: React.FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const collab = useCollaboration();
    const { dispatchToast } = useToastController();

    const link = collab.enabled && collab.room ? getCollabLink(collab.room) : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const peerCount = useMemo(() => collab.getAwarenessStates().size, [collab.awarenessVersion, collab]);

    const copyToClipboard = async () => {
        if (!link) {
            return;
        }
        await navigator.clipboard.writeText(link);
        dispatchToast(<CopySuccessToast />, { intent: 'success' });
    };

    return (
        <HotkeyBlockingDialogBody>
            <DialogTitle>{t('collab.title')}</DialogTitle>
            <DialogContent className={classes.content}>
                <div className={classes.row}>
                    <Switch
                        checked={collab.enabled}
                        label={t('collab.enableSharing')}
                        onChange={(_, data) => (data.checked ? collab.enable() : collab.disable())}
                    />
                    {collab.enabled && (
                        <Text size={300} className={classes.statusText}>
                            {collab.connected
                                ? t('collab.connected', { count: peerCount })
                                : t('collab.connecting', { count: peerCount })}
                        </Text>
                    )}
                </div>

                <Field label={t('collab.yourName')}>
                    <Input
                        value={collab.user.name}
                        onChange={(_, data) => collab.setUserName(data.value)}
                        disabled={!collab.enabled}
                    />
                </Field>

                <div>
                    <Label>{t('collab.icon')}</Label>
                    <div className={classes.iconGrid}>
                        {ICON_CHOICES.map((row, i) => (
                            <div key={i} className={classes.iconRow}>
                                {row.map((iconId) => {
                                    const iconUrl = getPartyIconUrl(iconId);
                                    const selected = collab.user.icon === iconUrl;
                                    return (
                                        <Button
                                            key={iconId}
                                            appearance={selected ? 'primary' : 'transparent'}
                                            icon={<Image src={iconUrl} width={32} height={32} />}
                                            onClick={() => collab.setUserIcon(iconUrl)}
                                            disabled={!collab.enabled}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {collab.enabled && (
                    <Field label={t('collab.shareLink')}>
                        <Input value={link} readOnly />
                    </Field>
                )}
            </DialogContent>

            <DialogActions fluid className={classes.actions}>
                {collab.enabled && (
                    <Button appearance="primary" icon={<CopyRegular />} onClick={copyToClipboard} disabled={!link}>
                        {t('collab.copyLink')}
                    </Button>
                )}
                <DialogTrigger disableButtonEnhancement>
                    <Button>{t('actions.close')}</Button>
                </DialogTrigger>
            </DialogActions>
        </HotkeyBlockingDialogBody>
    );
};

const CopySuccessToast: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Toast>
            <ToastTitle>{t('collab.linkCopied')}</ToastTitle>
        </Toast>
    );
};

const useStyles = makeStyles({
    content: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalM,
    },
    actions: {
        width: '100%',
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: tokens.spacingHorizontalM,
    },
    statusText: {
        color: tokens.colorNeutralForeground3,
        whiteSpace: 'nowrap',
    },
    iconGrid: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalXS,
        marginTop: tokens.spacingVerticalXS,
    },
    iconRow: {
        display: 'flex',
        flexFlow: 'row',
        gap: tokens.spacingHorizontalXS,
        flexWrap: 'wrap',
    },
});
