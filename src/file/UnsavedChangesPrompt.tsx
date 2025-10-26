import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from '@fluentui/react-components';
import React, { useId } from 'react';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useAsyncModalResolveCallback } from '../useAsyncModal';
import { FilePromptProps } from './FilePrompts';
import { useTranslation } from 'react-i18next';

export const UnsavedChangesPrompt: React.FC<FilePromptProps> = ({ resolve, ...props }) => {
    const confirmId = useId();
    const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);
    const { t } = useTranslation();

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>{t('unsavedChanges.title')}</DialogTitle>
                    <DialogContent>{t('file.unsavedChanges.openMessage')}</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                {t('file.unsavedChanges.openAnyways')}
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
