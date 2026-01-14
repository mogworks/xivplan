import {
    Menu,
    MenuButtonProps,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Toolbar,
    ToolbarDivider,
    makeStyles,
} from '@fluentui/react-components';
import {
    ArrowDownloadRegular,
    ArrowRedoRegular,
    ArrowUndoRegular,
    OpenRegular,
    SaveEditRegular,
    SaveRegular,
} from '@fluentui/react-icons';
import React, { ReactElement, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InPortal } from 'react-reverse-portal';
import { CollapsableSplitButton, CollapsableToolbarButton } from './CollapsableToolbarButton';
import { MergeObjectsButton } from './MergeObjectsButton';
import { FileSource, useScene, useSceneUndoRedoPossible, useSetSource } from './SceneProvider';
import { StepScreenshotButton } from './StepScreenshotButton';
import { ToolbarContext } from './ToolbarContext';
import { saveFile } from './file';
import { OpenDialog, SaveAsDialog } from './file/FileDialog';
import { ShareDialogButton } from './file/ShareDialogButton';
import { downloadSceneAsPSD, downloadSceneAsXivplanCn, getBlobSource } from './file/blob';
import { DialogOpenContext } from './useCloseDialog';
import { useHotkeys } from './useHotkeys';
import { useIsDirty, useSetSavedState } from './useIsDirty';

const useStyles = makeStyles({
    toolbar: {
        paddingLeft: 0,
        paddingRight: 0,
    },
});

export const MainToolbar: React.FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const toolbarNode = useContext(ToolbarContext);
    const { dispatch } = useScene();
    const [undoPossible, redoPossible] = useSceneUndoRedoPossible();
    const [openFileOpen, setOpenFileOpen] = useState(false);

    const undo = () => {
        dispatch({ type: 'undo' });
    };
    const redo = () => {
        dispatch({ type: 'redo' });
    };

    useHotkeys(
        'ctrl+o',
        { category: '2.File', help: t('hotkeys.open') },
        (e) => {
            setOpenFileOpen(true);
            e.preventDefault();
        },
        [setOpenFileOpen],
    );

    return (
        <>
            <DialogOpenContext value={setOpenFileOpen}>
                <OpenDialog open={openFileOpen} onOpenChange={(ev, data) => setOpenFileOpen(data.open)} />
            </DialogOpenContext>

            <InPortal node={toolbarNode}>
                <Toolbar className={classes.toolbar}>
                    {/* <CollapsableToolbarButton icon={<NewRegular />}>{t('toolbar.new')}</CollapsableToolbarButton> */}
                    <CollapsableToolbarButton icon={<OpenRegular />} onClick={() => setOpenFileOpen(true)}>
                        {t('toolbar.open')}
                    </CollapsableToolbarButton>

                    <SaveButton />

                    <CollapsableToolbarButton icon={<ArrowUndoRegular />} onClick={undo} disabled={!undoPossible}>
                        {t('toolbar.undo')}
                    </CollapsableToolbarButton>
                    <CollapsableToolbarButton icon={<ArrowRedoRegular />} onClick={redo} disabled={!redoPossible}>
                        {t('toolbar.redo')}
                    </CollapsableToolbarButton>

                    <ToolbarDivider />

                    <ShareDialogButton>{t('toolbar.share')}</ShareDialogButton>

                    <StepScreenshotButton>{t('toolbar.screenshot')}</StepScreenshotButton>
                    <MergeObjectsButton>{t('toolbar.mergeObjects')}</MergeObjectsButton>
                </Toolbar>
            </InPortal>
        </>
    );
};

interface SaveButtonState {
    type: 'save' | 'saveas' | 'downloadAsXivplanCn' | 'downloadAsPSD';
    text: string;
    icon: ReactElement;
    disabled?: boolean;
}

function getSaveButtonState(
    source: FileSource | undefined,
    isDirty: boolean,
    t: (key: string) => string,
): SaveButtonState {
    if (!source) {
        return { type: 'saveas', text: t('toolbar.saveAs'), icon: <SaveEditRegular /> };
    }

    if (source.type === 'blob') {
        return { type: 'downloadAsXivplanCn', text: t('toolbar.downloadAsXivplanCn'), icon: <ArrowDownloadRegular /> };
    }

    return { type: 'save', text: t('toolbar.save'), icon: <SaveRegular />, disabled: !isDirty };
}

const SaveButton: React.FC = () => {
    const { t } = useTranslation();
    const isDirty = useIsDirty();
    const setSavedState = useSetSavedState();
    const [saveAsOpen, setSaveAsOpen] = useState(false);
    const { canonicalScene, source } = useScene();
    const setSource = useSetSource();

    const { type, text, icon, disabled } = getSaveButtonState(source, isDirty, t);

    const save = async () => {
        if (!source) {
            setSaveAsOpen(true);
        } else if (isDirty) {
            await saveFile(canonicalScene, source);
            setSavedState(canonicalScene);
        }
    };

    const downloadAsXivplanCn = () => {
        downloadSceneAsXivplanCn(canonicalScene, source?.name);
        if (!source) {
            setSource(getBlobSource());
        }
    };

    const downloadAsPSD = () => {
        downloadSceneAsPSD(canonicalScene, source?.name);
    };

    const handleClick = () => {
        switch (type) {
            case 'save':
                save();
                break;

            case 'saveas':
                setSaveAsOpen(true);
                break;

            case 'downloadAsXivplanCn':
                downloadAsXivplanCn();
                break;

            case 'downloadAsPSD':
                downloadAsPSD();
                break;
        }
    };

    useHotkeys(
        'ctrl+s',
        { category: '2.File', help: t('hotkeys.save') },
        (e) => {
            save();
            e.preventDefault();
        },
        [save],
    );
    useHotkeys(
        'ctrl+shift+s',
        { category: '2.File', help: t('hotkeys.saveAs') },
        (e) => {
            setSaveAsOpen(true);
            e.preventDefault();
        },
        [setSaveAsOpen],
    );

    return (
        <>
            <Menu positioning="below-end">
                <MenuTrigger disableButtonEnhancement>
                    {(triggerProps: MenuButtonProps) => (
                        <CollapsableSplitButton
                            menuButton={triggerProps}
                            primaryActionButton={{ onClick: handleClick, disabled }}
                            icon={icon}
                            appearance="subtle"
                        >
                            {text}
                        </CollapsableSplitButton>
                    )}
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>
                        {type !== 'saveas' && (
                            <MenuItem icon={<SaveEditRegular />} onClick={() => setSaveAsOpen(true)}>
                                {t('toolbar.saveAsEllipsis')}
                            </MenuItem>
                        )}
                        {type !== 'downloadAsXivplanCn' && (
                            <MenuItem icon={<ArrowDownloadRegular />} onClick={downloadAsXivplanCn}>
                                {t('toolbar.downloadAsXivplanCn')}
                            </MenuItem>
                        )}
                        {type !== 'downloadAsPSD' && (
                            <MenuItem icon={<ArrowDownloadRegular />} onClick={downloadAsPSD}>
                                {t('toolbar.downloadAsPSD')}
                            </MenuItem>
                        )}
                    </MenuList>
                </MenuPopover>
            </Menu>
            <DialogOpenContext value={setSaveAsOpen}>
                <SaveAsDialog open={saveAsOpen} onOpenChange={(ev, data) => setSaveAsOpen(data.open)} />
            </DialogOpenContext>
        </>
    );
};
