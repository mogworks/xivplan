import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogProps,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from '@fluentui/react-components';
import React, { useId } from 'react';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useAsyncModalResolveCallback } from '../useAsyncModal';
import { useTranslation } from 'react-i18next';

export interface FilePromptProps extends Omit<DialogProps, 'children'> {
    resolve(result: boolean): void;
}

export interface OverwriteFilePromptProps extends FilePromptProps {
    filename: string;
}

export const OverwriteFilePrompt: React.FC<OverwriteFilePromptProps> = ({ resolve, filename, ...props }) => {
    const confirmId = useId();
    const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);
    const { t } = useTranslation();

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface backdrop={{ appearance: 'dimmed' }}>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>{t('file.prompts.overwriteTitle', { filename })}</DialogTitle>
                    <DialogContent>{t('file.prompts.overwriteMessage')}</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                {t('file.prompts.overwrite')}
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                            <Button>{t('actions.cancel')}</Button>
                        </DialogTrigger>
                    </DialogActions>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export interface DeleteFilePromptProps extends FilePromptProps {
    filename: string;
}

export const DeleteFilePrompt: React.FC<DeleteFilePromptProps> = ({ resolve, filename, ...props }) => {
    const confirmId = useId();
    const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);
    const { t } = useTranslation();

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface backdrop={{ appearance: 'dimmed' }}>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>{t('file.prompts.deleteTitle', { filename })}</DialogTitle>
                    <DialogContent>{t('file.prompts.deleteMessage')}</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                {t('file.prompts.delete')}
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                            <Button>{t('actions.cancel')}</Button>
                        </DialogTrigger>
                    </DialogActions>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};
