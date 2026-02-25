import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Link,
    makeStyles,
    typographyStyles,
} from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from './ExternalLink';
import { HotkeyBlockingDialogBody } from './HotkeyBlockingDialogBody';

export interface AboutDialogProps {
    className?: string;
}

export const AboutDialog: React.FC<AboutDialogProps> = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger>
                <Link {...props}>{t('about.title')}</Link>
            </DialogTrigger>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>{t('about.title')}</DialogTitle>
                    <DialogContent className={classes.content}>
                        <p>{t('about.xivplanCnDescription.part1')}</p>
                        <p>{t('about.xivplanCnDescription.part2')}</p>
                        <hr className={classes.divider} />
                        <p>
                            XIVPlan is a tool for quickly diagramming raid strategies for Final Fantasy XIV, inspired by{' '}
                            <ExternalLink href="https://raidplan.io">RaidPlan.io</ExternalLink> and{' '}
                            <ExternalLink href="https://ff14.toolboxgaming.space">
                                FF14 Toolbox Gaming Space
                            </ExternalLink>
                            .
                        </p>
                        <p>
                            XIVPlan is open source on{' '}
                            <ExternalLink href="https://github.com/joelspadin/xivplan">GitHub</ExternalLink>. If you
                            find a bug or have other feedback, please create a{' '}
                            <ExternalLink href="https://github.com/joelspadin/xivplan/issues/new/choose">
                                new issue
                            </ExternalLink>{' '}
                            on GitHub.
                        </p>
                        <h2>Credits</h2>
                        <p>XIVPlan is © 2021 Joel Spadin and contributors.</p>
                        <p>Job, role, waymark, and enemy icons are © SQUARE ENIX CO., LTD. All Rights Reserved.</p>
                        <p>
                            <ExternalLink href="https://magentalava.gumroad.com/l/limitcuticons">
                                Limit cut counter icons
                            </ExternalLink>{' '}
                            by yullanellis.
                        </p>
                        <p>
                            Some{' '}
                            <ExternalLink href="https://github.com/kotarou3/ffxiv-arena-images">
                                arena background images
                            </ExternalLink>{' '}
                            by kotarou3
                        </p>
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">{t('about.close')}</Button>
                        </DialogTrigger>
                    </DialogActions>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};

const useStyles = makeStyles({
    content: {
        '& h2': typographyStyles.subtitle2,
    },
    divider: {
        border: 'none',
        borderTop: '1px dashed',
        borderTopColor: 'var(--colorNeutralStroke1)',
        margin: '16px 0',
    },
});
