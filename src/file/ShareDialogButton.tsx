import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Dropdown,
    Field,
    Option,
    Tab,
    TabList,
    Textarea,
    Toast,
    ToastTitle,
    makeStyles,
    tokens,
    useToastController,
} from '@fluentui/react-components';
import { CopyRegular, ShareRegular } from '@fluentui/react-icons';
import React, { ReactNode, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CollapsableToolbarButton } from '../CollapsableToolbarButton';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useScene } from '../SceneProvider';
import { TabActivity } from '../TabActivity';
import { sceneToText } from '../file';
import { sceneToStrategyBoard } from '../lib/strategy/convert';
import { Scene } from '../scene';
import { removeFileExtension } from '../util';
import { DownloadButton } from './DownloadButton';

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

type Tabs = 'url' | 'strategyBoard';

const ShareDialogBody: React.FC = () => {
    const classes = useStyles();
    const { canonicalScene, stepIndex, source } = useScene();
    const { dispatchToast } = useToastController();
    const [tab, setTab] = useState<Tabs>('url');
    const [strategyBoardStep, setStrategyBoardStep] = useState<number>(stepIndex);
    const url = getSceneUrl(canonicalScene);
    const strategyBoardCode = getStrategyBoardCode(
        canonicalScene,
        strategyBoardStep,
        source ? removeFileExtension(source.name) : undefined,
    );
    const { t } = useTranslation();

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        dispatchToast(<CopySuccessToast />, { intent: 'success' });
    };

    return (
        <HotkeyBlockingDialogBody>
            <DialogTitle>{t('share.title')}</DialogTitle>
            <DialogContent>
                <TabList
                    size="small"
                    className={classes.tabs}
                    selectedValue={tab}
                    onTabSelect={(ev, data) => setTab(data.value as Tabs)}
                >
                    <Tab value="url">{t('share.tabs.url')}</Tab>
                    <Tab value="strategyBoard">{t('share.tabs.strategyBoard')}</Tab>
                </TabList>
                <TabActivity value="url" activeTab={tab}>
                    <Field label={t('share.linkLabel')}>
                        <Textarea value={url} contentEditable={false} appearance="filled-darker" rows={6} />
                    </Field>
                    <p>
                        <Trans i18nKey="share.fallbackText" components={{ importLink: <strong /> }} />
                    </p>
                </TabActivity>
                <TabActivity value="strategyBoard" activeTab={tab}>
                    <Field label={t('share.stepLabel')}>
                        <Dropdown
                            appearance="filled-darker"
                            value={t('share.step', { index: strategyBoardStep + 1 })}
                            selectedOptions={[strategyBoardStep.toString()]}
                            onOptionSelect={(ev, data) => setStrategyBoardStep(parseInt(data.optionValue as string))}
                        >
                            {canonicalScene.steps.map((_, index) => {
                                const stepText = t('share.step', { index: index + 1 });
                                return (
                                    <Option key={index} value={index.toString()} text={stepText}>
                                        {stepText}
                                    </Option>
                                );
                            })}
                        </Dropdown>
                    </Field>
                    <Field label={t('share.strategyBoardLabel')}>
                        <Textarea
                            value={strategyBoardCode}
                            contentEditable={false}
                            appearance="filled-darker"
                            rows={6}
                        />
                    </Field>
                    <p>
                        <Trans i18nKey="share.strategyBoardFallbackText" components={{ importLink: <strong /> }} />
                    </p>
                </TabActivity>
            </DialogContent>
            <DialogActions fluid className={classes.actions}>
                <DownloadButton appearance="primary" className={classes.download} />

                <Button
                    appearance="primary"
                    icon={<CopyRegular />}
                    onClick={() => copyToClipboard(tab === 'url' ? url : strategyBoardCode)}
                >
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

function getStrategyBoardCode(scene: Scene, stepIndex: number, boardName?: string): string {
    try {
        return sceneToStrategyBoard(scene, stepIndex, boardName);
    } catch (e) {
        console.error('Failed to convert scene to strategy board code:', e);
        return '';
    }
}

const useStyles = makeStyles({
    actions: {
        width: '100%',
    },
    download: {
        marginRight: 'auto',
    },
    tabs: {
        marginBottom: tokens.spacingVerticalM,
    },
});
