import {
    makeStyles,
    Menu,
    MenuButtonProps,
    MenuCheckedValueChangeData,
    MenuCheckedValueChangeEvent,
    MenuGroup,
    MenuGroupHeader,
    MenuItemRadio,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Portal,
    SplitButtonProps,
    Toast,
    ToastTitle,
    useToastController,
} from '@fluentui/react-components';
import { MergeRegular } from '@fluentui/react-icons';
import Konva from 'konva';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage, useTimeoutFn } from 'react-use';
import { CollapsableSplitButton } from './CollapsableToolbarButton';
import { getCanvasSize, getSceneX, getSceneY } from './coord';
import { MessageToast } from './MessageToast';
import { ObjectLoadingContext } from './ObjectLoadingContext';
import { ObjectLoadingProvider } from './ObjectLoadingProvider';
import { ScenePreview } from './render/SceneRenderer';
import { ObjectType, SceneStep } from './scene';
import { useScene } from './SceneProvider';
import { useSelection } from './selection';
import { ToastDismissButton } from './ToastDismissButton';
import { useHotkeys } from './useHotkeys';

const MERGE_TIMEOUT = 10000;

export type MergeObjectsButtonProps = SplitButtonProps;

export const MergeObjectsButton: React.FC<MergeObjectsButtonProps> = (props) => {
    const classes = useStyles();
    const [scale, setScale] = useLocalStorage('mergePixelRatio', 2);
    const { t } = useTranslation();
    const [mergingObjects, setMergingObjects] = useState(false);
    const { dispatchToast } = useToastController();
    const [selection] = useSelection();

    const checkedValues: Record<string, string[]> = {
        scale: [scale?.toString() ?? '2'],
    };

    const handleCheckedValueChanged = (e: MenuCheckedValueChangeEvent, data: MenuCheckedValueChangeData) => {
        if (data.name === 'scale') {
            setScale(parseInt(data.checkedItems?.[0] ?? '2'));
        }
    };

    // Cancel the merge if it takes too long so it can't get stuck.
    const handleTimeout = () => {
        if (!mergingObjects) {
            return;
        }

        setMergingObjects(false);
        dispatchToast(<MessageToast title={t('toasts.error')} message={t('toasts.mergeTimeout')} />, {
            intent: 'error',
        });
    };

    const [, , startTimeout] = useTimeoutFn(handleTimeout, MERGE_TIMEOUT);

    const startMerge = () => {
        if (selection.size === 0) {
            dispatchToast(<MessageToast title={t('toasts.error')} message={t('toasts.noSelection')} />, {
                intent: 'error',
            });
            return;
        }
        setMergingObjects(true);
        startTimeout();
    };

    useHotkeys(
        'ctrl+shift+m',
        { category: '7.Steps', help: t('hotkeys.mergeObjects') },
        (ev) => {
            startMerge();
            ev.preventDefault();
        },
        [selection],
    );

    return (
        <>
            <Menu
                positioning="below-end"
                checkedValues={checkedValues}
                onCheckedValueChange={handleCheckedValueChanged}
            >
                <MenuTrigger disableButtonEnhancement>
                    {(triggerProps: MenuButtonProps) => (
                        <CollapsableSplitButton
                            {...props}
                            menuButton={triggerProps}
                            primaryActionButton={{
                                onClick: startMerge,
                                disabled: mergingObjects || selection.size === 0,
                            }}
                            icon={<MergeRegular />}
                            appearance="subtle"
                        />
                    )}
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>
                        <MenuGroup>
                            <MenuGroupHeader>{t('merge.qualityHeader')}</MenuGroupHeader>
                            <MenuItemRadio name="scale" value="1">
                                {t('merge.quality1x')}
                            </MenuItemRadio>
                            <MenuItemRadio name="scale" value="2">
                                {t('merge.quality2x')}
                            </MenuItemRadio>
                            <MenuItemRadio name="scale" value="4">
                                {t('merge.quality4x')}
                            </MenuItemRadio>
                        </MenuGroup>
                    </MenuList>
                </MenuPopover>
            </Menu>
            {mergingObjects && (
                <Portal mountNode={{ className: classes.merge }}>
                    <ObjectLoadingProvider>
                        <MergeComponent
                            onMergeDone={(error) => {
                                setMergingObjects(false);
                                if (error) {
                                    dispatchToast(<MessageToast title={t('toasts.error')} message={error} />, {
                                        intent: 'error',
                                    });
                                } else {
                                    dispatchToast(<MergeSuccessToast />, {
                                        intent: 'success',
                                        timeout: 2000,
                                    });
                                }
                            }}
                            selection={selection}
                            scale={scale}
                        />
                    </ObjectLoadingProvider>
                </Portal>
            )}
        </>
    );
};

const MergeSuccessToast = () => {
    const { t } = useTranslation();
    return (
        <Toast>
            <ToastTitle action={<ToastDismissButton />}>{t('toasts.objectsMerged')}</ToastTitle>
        </Toast>
    );
};

interface MergeComponentProps {
    onMergeDone: (error?: unknown) => void;
    selection: ReadonlySet<number>;
    scale?: number;
}

const MergeComponent: React.FC<MergeComponentProps> = ({ onMergeDone, selection, scale }) => {
    const { isLoading } = useContext(ObjectLoadingContext);
    const { scene, stepIndex, dispatch } = useScene();
    const [frozenScene] = useState(scene);
    const [frozenStepIndex] = useState(stepIndex);
    const [frozenSelection] = useState(selection);
    const [frozenScale] = useState(scale);
    const ref = useRef<Konva.Stage>(null);
    const { t } = useTranslation();

    // Create a new step with only the selected objects
    const createSelectionOnlyStep = (originalStep: SceneStep, selection: ReadonlySet<number>): SceneStep => {
        return {
            objects: originalStep.objects.filter((object) => selection.has(object.id)),
        };
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const mergeObjects = async () => {
        try {
            if (!ref.current) {
                throw new Error('Stage missing');
            }

            const nodes = ref.current.find(function (node: Konva.Node) {
                return node.getType() !== 'Layer' && node.getClassName() !== 'Group';
            });

            // get nodes's boudnbounding box
            const bbox = nodes.reduce(
                (acc, node) => {
                    const nodeBbox = node.getClientRect();
                    const r = nodeBbox.x + nodeBbox.width;
                    const b = nodeBbox.y + nodeBbox.height;
                    return {
                        x: Math.min(acc.x, nodeBbox.x),
                        y: Math.min(acc.y, nodeBbox.y),
                        r: Math.max(acc.r, r),
                        b: Math.max(acc.b, b),
                    };
                },
                { x: Infinity, y: Infinity, r: -Infinity, b: -Infinity },
            );

            // Take screenshot of only the bounding box area using toDataURL with crop parameters
            const dataUrl = ref.current.toDataURL({
                mimeType: 'image/png',
                pixelRatio: frozenScale ?? 2,
                x: bbox.x,
                y: bbox.y,
                width: bbox.r - bbox.x,
                height: bbox.b - bbox.y,
            });

            if (!dataUrl) {
                throw new Error('Failed to generate image');
            }

            // Create new Asset object with correct size and position
            const newAsset = {
                type: ObjectType.Asset,
                name: t('objects.mergedAsset'),
                image: dataUrl,
                opacity: 100,
                width: bbox.r - bbox.x,
                height: bbox.b - bbox.y,
                rotation: 0,
                flipHorizontal: false,
                flipVertical: false,
                hNum: 1,
                vNum: 1,
                x: getSceneX(frozenScene, bbox.x) + (bbox.r - bbox.x) / 2,
                y: getSceneY(frozenScene, bbox.y) - (bbox.b - bbox.y) / 2,
            };

            // Remove selected objects and add new asset
            dispatch({ type: 'remove', ids: Array.from(frozenSelection) });
            dispatch({ type: 'add', object: newAsset });
            dispatch({ type: 'commit' });

            onMergeDone();
        } catch (ex) {
            onMergeDone(ex);
        }
    };

    // Delay merge by at least one render to make sure any objects that need
    // to load resources have reported that they are loading.
    const [firstRender, setFirstRender] = useState(true);
    useEffect(() => {
        setFirstRender(false);
    }, [setFirstRender]);

    // Avoid double merge in development builds.
    const mergeTaken = useRef(false);

    useEffect(() => {
        if (!firstRender && !isLoading && !mergeTaken.current) {
            mergeObjects();

            return () => {
                mergeTaken.current = true;
            };
        }
    }, [firstRender, isLoading, mergeObjects]);

    // Create a temporary scene with only the selected objects
    const tempScene = {
        ...frozenScene,
        steps: frozenScene.steps.map((step, index) => {
            if (index === frozenStepIndex) {
                return createSelectionOnlyStep(step, frozenSelection);
            }
            return step;
        }),
    };

    const size = getCanvasSize(frozenScene);

    return (
        <ScenePreview
            ref={ref}
            scene={tempScene}
            stepIndex={frozenStepIndex}
            width={size.width}
            height={size.height}
            showArena={false}
        />
    );
};

const useStyles = makeStyles({
    merge: {
        visibility: 'hidden',
    },
});
