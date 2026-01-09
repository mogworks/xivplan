import { Button, DialogActions, DialogTrigger } from '@fluentui/react-components';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { HtmlPortalNode, InPortal } from 'react-reverse-portal';
import { ExternalLink } from '../ExternalLink';
import { useLoadScene, useScene, useSetSource } from '../SceneProvider';
import { openFile, saveFile } from '../file';
import { useCloseDialog } from '../useCloseDialog';
import { useIsDirty, useSetSavedState } from '../useIsDirty';
import { DownloadButton } from './DownloadButton';
import { FileBrowser } from './FileBrowser';
import { useConfirmUnsavedChanges } from './confirm';
import { addRecentFile, getFileSource, showSavePlanPicker } from './filesystem';

export interface OpenFileSystemProps {
    actions: HtmlPortalNode;
}

export const OpenFileSystem: React.FC<OpenFileSystemProps> = ({ actions }) => {
    const isDirty = useIsDirty();
    const loadScene = useLoadScene();
    const dismissDialog = useCloseDialog();
    const [confirmUnsavedChanges, renderModal] = useConfirmUnsavedChanges();
    const [selectedFile, setSelectedFile] = useState<FileSystemFileHandle>();
    const { t } = useTranslation();

    const loadSceneFromFile = async (handle: FileSystemFileHandle) => {
        if (isDirty && !(await confirmUnsavedChanges())) {
            return;
        }

        const source = getFileSource(handle);
        const scene = await openFile(source);

        loadScene(scene, source);
        dismissDialog();
    };

    return (
        <>
            <FileBrowser onSelectionChanged={setSelectedFile} onFileSelected={loadSceneFromFile} />
            {renderModal()}
            <InPortal node={actions}>
                <DialogActions>
                    <Button
                        appearance="primary"
                        disabled={!selectedFile}
                        onClick={() => selectedFile && loadSceneFromFile(selectedFile)}
                    >
                        {t('file.dialog.buttons.open')}
                    </Button>
                    <DialogTrigger>
                        <Button>{t('actions.cancel')}</Button>
                    </DialogTrigger>
                </DialogActions>
            </InPortal>
        </>
    );
};

export interface SaveFileSystemProps {
    actions: HtmlPortalNode;
}

export const SaveFileSystem: React.FC<SaveFileSystemProps> = ({ actions }) => {
    const setSavedState = useSetSavedState();
    const dismissDialog = useCloseDialog();
    const setSource = useSetSource();
    const { canonicalScene, source } = useScene();
    const { t } = useTranslation();

    const currentName = source?.name;

    const save = async () => {
        const handle = await showSavePlanPicker(currentName);
        if (!handle) {
            return;
        }

        const source = getFileSource(handle);
        console.log('Saving to', handle.name, source);
        if (handle.name.endsWith('.xivplancn')) {
            await saveFile(canonicalScene, source, 'XivplanCn');
        } else if (handle.name.endsWith('.psd')) {
            await saveFile(canonicalScene, source, 'PSD');
        }
        await addRecentFile(handle);

        setSource(source);
        setSavedState(canonicalScene);
        dismissDialog();
    };

    return (
        <>
            <div>
                <p>{t('file.saveDialog.fsSaveDescription')}</p>
            </div>
            <InPortal node={actions}>
                <DialogActions>
                    <Button appearance="primary" onClick={save}>
                        {t('file.dialog.buttons.saveAs')}
                    </Button>
                    <DialogTrigger>
                        <Button>{t('actions.cancel')}</Button>
                    </DialogTrigger>
                </DialogActions>
            </InPortal>
        </>
    );
};

export interface FileSystemNotSupportedMessageProps {
    actions: HtmlPortalNode;
    download?: boolean;
}

export const FileSystemNotSupportedMessage: React.FC<FileSystemNotSupportedMessageProps> = ({ actions, download }) => {
    const { t } = useTranslation();
    return (
        <>
            <div>
                <p>
                    <Trans
                        i18nKey="file.fsNotSupported.message1"
                        components={{
                            ext: <strong />,
                        }}
                    />
                </p>
                <p>
                    <Trans
                        i18nKey="file.fsNotSupported.message2"
                        components={{
                            edge: <ExternalLink href="https://www.microsoft.com/edge" />,
                            chrome: <ExternalLink href="https://www.google.com/chrome/" />,
                        }}
                    />
                </p>
            </div>
            <InPortal node={actions}>
                <DialogActions>
                    {download && <DownloadButton appearance="primary" />}
                    <DialogTrigger>
                        <Button>{t('actions.cancel')}</Button>
                    </DialogTrigger>
                </DialogActions>
            </InPortal>
        </>
    );
};
