import { useToastController } from '@fluentui/react-components';
import React, { useEffect } from 'react';
import { useSceneLoadError } from './file/share';
import { MessageToast } from './MessageToast';
import { useTranslation } from 'react-i18next';

export const SceneLoadErrorNotifier: React.FC = () => {
    const sceneLoadError = useSceneLoadError();
    const { dispatchToast } = useToastController();
    const { t } = useTranslation();

    useEffect(() => {
        if (sceneLoadError) {
            dispatchToast(<MessageToast title={t('toasts.failedToLoadPlan')} message={sceneLoadError} />, {
                intent: 'error',
                timeout: -1,
            });
        }
    }, [sceneLoadError, dispatchToast, t]);

    return null;
};
