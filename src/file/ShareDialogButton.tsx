import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Field,
    Textarea,
    Toast,
    ToastTitle,
    makeStyles,
    useToastController,
} from '@fluentui/react-components';
import { CopyRegular, ShareRegular } from '@fluentui/react-icons';
import React, { ReactNode } from 'react';
import { CollapsableToolbarButton } from '../CollapsableToolbarButton';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useScene } from '../SceneProvider';
import { sceneToText } from '../file';
import { Scene } from '../scene';
import { DownloadButton } from './DownloadButton';
import { Trans, useTranslation } from 'react-i18next';

export interface ShareDialogButtonProps {
    children?: ReactNode | undefined;
}

export const ShareDialogButton: React.FC<ShareDialogButtonProps> = ({ children }) => {
    return (
        <Dialog>
            <DialogTrigger>
                <CollapsableToolbarButton icon={<ShareRegular />}>{children}</CollapsableToolbarButton>
            </DialogTrigger>

            <DialogSurface>
                <ShareDialogBody />
            </DialogSurface>
        </Dialog>
    );
};

const ShareDialogBody: React.FC = () => {
    const classes = useStyles();
    const { canonicalScene } = useScene();
    const { dispatchToast } = useToastController();
    const url = getSceneUrl(canonicalScene);
    const { t } = useTranslation();

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(url);
        dispatchToast(<CopySuccessToast />, { intent: 'success' });
    };

    return (
        <HotkeyBlockingDialogBody>
            <DialogTitle>{t('share.title')}</DialogTitle>
            <DialogContent>
                <Field label={t('share.linkLabel')}>
                    <Textarea value={url} contentEditable={false} appearance="filled-darker" rows={6} />
                </Field>
                <p>
                    <Trans i18nKey="share.fallbackText" components={{ importLink: <strong /> }} />
                </p>
            </DialogContent>
            <DialogActions fluid className={classes.actions}>
                <DownloadButton appearance="primary" className={classes.download} />

                <Button appearance="primary" icon={<CopyRegular />} onClick={copyToClipboard}>
                    {t('share.copyToClipboard')}
                </Button>

                <DialogTrigger disableButtonEnhancement>
                    <Button>{t('actions.close')}</Button>
                </DialogTrigger>
            </DialogActions>
        </HotkeyBlockingDialogBody>
    );
};

const CopySuccessToast = () => {
    const { t } = useTranslation();
    return (
        <Toast>
            <ToastTitle>{t('share.linkCopied')}</ToastTitle>
        </Toast>
    );
};

function getSceneUrl(scene: Scene) {
    const data = sceneToText(scene);
    return `${location.protocol}//${location.host}${location.pathname}#/plan/${data}`;
}

const useStyles = makeStyles({
    actions: {
        width: '100%',
    },
    download: {
        marginRight: 'auto',
    },
});
