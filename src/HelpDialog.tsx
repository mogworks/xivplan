import {
    Button,
    Dialog,
    DialogContent,
    DialogProps,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    makeStyles,
    tokens,
    typographyStyles,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { HotkeyBlockingDialogBody } from './HotkeyBlockingDialogBody';
import { HotkeyName } from './HotkeyName';
import { useRegisteredHotkeys } from './useHotkeys';

export type HelpDialogProps = Omit<DialogProps, 'children'>;

export const HelpDialog: React.FC<HelpDialogProps> = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Dialog {...props}>
            <DialogSurface className={classes.surface}>
                <HotkeyBlockingDialogBody>
                    <DialogTitle
                        action={
                            <DialogTrigger action="close">
                                <Button appearance="subtle" aria-label="close" icon={<Dismiss24Regular />} />
                            </DialogTrigger>
                        }
                    >
                        {t('helpDialog.title')}
                    </DialogTitle>
                    <DialogContent className={classes.content}>
                        <section className={classes.section}>
                            <h2>{t('helpDialog.leftPanel')}</h2>
                            <h3>{t('helpDialog.arena')}</h3>
                            <p>{t('helpDialog.arenaDescription')}</p>

                            <h3>{t('helpDialog.objects')}</h3>
                            <p>{t('helpDialog.objectsDescription')}</p>

                            <h3>{t('helpDialog.icons')}</h3>
                            <p>{t('helpDialog.iconsDescription')}</p>

                            <h3>{t('helpDialog.draw')}</h3>
                            <p>{t('helpDialog.drawDescription')}</p>

                            <h2>{t('helpDialog.rightPanel')}</h2>
                            <h3>{t('helpDialog.properties')}</h3>
                            <p>{t('helpDialog.propertiesDescription')}</p>

                            <h3>{t('helpDialog.scene')}</h3>
                            <p>{t('helpDialog.sceneDescription')}</p>
                        </section>

                        <section className={classes.section}>
                            <h2>{t('helpDialog.keyboardShortcuts')}</h2>
                            <HotkeyList />
                        </section>

                        <section className={classes.section}>
                            <h2>{t('helpDialog.mouseShortcuts')}</h2>
                            <dl className={classes.hotkeys}>
                                <dt>{t('helpDialog.leftClick')}</dt>
                                <dd>{t('helpDialog.selectObject')}</dd>

                                <dt>
                                    <HotkeyName keys="ctrl" suffix={t('helpDialog.leftClick')} />
                                </dt>
                                <dd>{t('helpDialog.toggleSelection')}</dd>

                                <dt>
                                    <HotkeyName keys="shift" suffix={t('helpDialog.leftClick')} />
                                </dt>
                                <dd>{t('helpDialog.addToSelection')}</dd>

                                <dt>{t('helpDialog.leftClickDrag')}</dt>
                                <dd>{t('helpDialog.moveTransformObject')}</dd>

                                <dt>
                                    <HotkeyName keys="shift" suffix={t('helpDialog.leftClickDrag')} />
                                </dt>
                                <dd>{t('helpDialog.proportionalResize')}</dd>
                            </dl>
                        </section>
                    </DialogContent>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};

const HotkeyList: React.FC = () => {
    const classes = useStyles();
    const hotkeys = useRegisteredHotkeys();

    return (
        <dl className={classes.hotkeys}>
            {hotkeys.map((info, i) => (
                <React.Fragment key={i}>
                    <dt>
                        <HotkeyName keys={info.keys} />
                    </dt>
                    <dd>{info.help}</dd>
                </React.Fragment>
            ))}
        </dl>
    );
};

const useStyles = makeStyles({
    surface: {
        maxWidth: 'fit-content',
    },
    content: {
        display: 'grid',
        gridTemplate: 'auto / minmax(15em, 25em) repeat(2, minmax(20em, auto))',
        columnGap: tokens.spacingHorizontalXXXL,
        ...typographyStyles.body1,

        '@media (max-width: 992px)': {
            display: 'flex',
            flexFlow: 'column',
        },

        '& h2': {
            ...typographyStyles.subtitle1,
            fontWeight: tokens.fontWeightRegular,

            marginTop: tokens.spacingVerticalS,
            marginBottom: tokens.spacingVerticalM,
            background: tokens.colorNeutralBackground1,
        },
        '& h3': {
            ...typographyStyles.subtitle2,
            marginBottom: tokens.spacingVerticalS,
        },

        '& h3 + p': {
            marginTop: 0,
        },
    },
    section: {},
    hotkeys: {
        display: 'grid',
        gridTemplate: 'auto / fit-content(30%) 1fr',

        overflow: 'auto',
        maxHeight: 'calc(100vh - 48px - 48px - 8px - 48px)',
        marginTop: 0,

        '@media (max-width: 992px)': {
            maxHeight: 'unset',
        },

        '& dt': {
            gridColumn: '1',
            display: 'flex',
            flexFlow: 'row',
            alignItems: 'center',
            paddingInlineStart: tokens.spacingHorizontalXS,
            paddingInlineEnd: tokens.spacingHorizontalL,
        },

        '& dd': {
            gridColumn: '2',
            margin: 0,
            paddingInlineEnd: tokens.spacingHorizontalXL,
        },

        '& dt, dd': {
            display: 'flex',
            flexFlow: 'row',
            alignItems: 'center',
            boxSizing: 'border-box',
            minHeight: '28px',

            ':nth-of-type(2n)': {
                background: tokens.colorNeutralBackgroundAlpha,
            },
        },
    },
});
