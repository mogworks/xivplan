import { Button, ButtonProps } from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';
import React from 'react';
import { useScene } from '../SceneProvider';
import { downloadScene } from './blob';
import { useTranslation } from 'react-i18next';

export const DownloadButton: React.FC<ButtonProps> = ({ ...props }) => {
    const { canonicalScene, source } = useScene();
    const { t } = useTranslation();

    return (
        <Button icon={<ArrowDownloadRegular />} onClick={() => downloadScene(canonicalScene, source?.name)} {...props}>
            {t('toolbar.download')}
        </Button>
    );
};
