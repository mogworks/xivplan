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
import { Action } from 'history';
import React, { PropsWithChildren, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Location, useNavigate } from 'react-router-dom';
import { useBeforeUnload } from 'react-use';
import { useCollaboration } from './collab/CollaborationProvider';
import { DirtyContext, SavedStateContext } from './DirtyContext';
import { Scene } from './scene';
import { useScene } from './SceneProvider';

export const DirtyProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { canonicalScene } = useScene();
    const collab = useCollaboration();
    const [savedState, setSavedState] = useState<Scene>(canonicalScene);
    const isDirty = !collab.enabled && canonicalScene !== savedState;

    return (
        <SavedStateContext value={setSavedState}>
            <DirtyContext value={isDirty}>
                {children}

                <NavLockPrompt locked={isDirty} />
            </DirtyContext>
        </SavedStateContext>
    );
};

interface NavLockProps {
    locked: boolean;
}

interface NextLocation {
    location: Location;
    action: Action;
}

type OpenChangeEventHandler = Required<DialogProps>['onOpenChange'];

const NavLockPrompt: React.FC<NavLockProps> = ({ locked }) => {
    const { t } = useTranslation();
    const message = t('unsavedChanges.leaveMessage');
    useBeforeUnload(locked, message);

    const confirmId = useId();
    const navigate = useNavigate();
    // const currentLocation = useLocation();

    const [showDialog, setShowDialog] = useState(false);
    const [nextLocation, setNextLocation] = useState<NextLocation>();

    // TODO: https://github.com/remix-run/react-router/issues/8139
    // const onPrompt = (location: Location, action: Action) => {
    //     if (location.pathname === currentLocation.pathname) {
    //         return true;
    //     }

    //     setNextLocation({ location, action });
    //     setShowDialog(true);
    //     return false;
    // };

    const onCancelNavigate = () => {
        setNextLocation(undefined);
        setShowDialog(false);
    };

    const onConfirmNavigate = () => {
        setShowDialog(false);

        if (!nextLocation) {
            return;
        }

        switch (nextLocation.action) {
            case Action.Pop:
                navigate(-1);
                break;

            case Action.Push:
                navigate(nextLocation.location);
                break;

            case Action.Replace:
                navigate(nextLocation.location, { replace: true });
                break;
        }
    };

    const onOpenChange: OpenChangeEventHandler = (ev, data) => {
        if (!data.open) {
            const target = ev.target as HTMLElement;
            if (target.id === confirmId) {
                onConfirmNavigate();
            } else {
                onCancelNavigate();
            }
        }
    };

    return (
        <>
            {/* <Prompt when={locked && !nextLocation} message={onPrompt} /> */}
            <Dialog open={showDialog} onOpenChange={onOpenChange}>
                <DialogSurface>
                    <DialogTitle>{t('unsavedChanges.title')}</DialogTitle>
                    <DialogContent>{message}</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                {t('unsavedChanges.leavePage')}
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                            <Button>{t('unsavedChanges.stayOnPage')}</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogSurface>
            </Dialog>
        </>
    );
};
