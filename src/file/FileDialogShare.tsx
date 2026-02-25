import {
    Button,
    DialogActions,
    DialogTrigger,
    Field,
    Textarea,
    TextareaOnChangeData,
} from '@fluentui/react-components';
import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HtmlPortalNode, InPortal } from 'react-reverse-portal';
import { useLoadScene } from '../SceneProvider';
import { textToScene } from '../file';
import { FORWARD_TRANSLATION_TABLE, STRATEGY_BOARD_PREFIX, STRATEGY_BOARD_SUFFIX } from '../lib/strategy/common';
import { strategyBoardToScene } from '../lib/strategy/convert';
import { decodeGameStrategyBoardString } from '../lib/strategy/decoder';
import { Scene } from '../scene';
import { useCloseDialog } from '../useCloseDialog';
import { useIsDirty } from '../useIsDirty';
import { useConfirmUnsavedChanges } from './confirm';
import { parseSceneLink } from './share';

export interface ImportFromStringProps {
    actions: HtmlPortalNode;
}

export const ImportFromString: React.FC<ImportFromStringProps> = ({ actions }) => {
    const isDirty = useIsDirty();
    const loadScene = useLoadScene();
    const dismissDialog = useCloseDialog();
    const { t } = useTranslation();

    const [confirmUnsavedChanges, renderModal] = useConfirmUnsavedChanges();
    const [data, setData] = useState<string | undefined>('');
    const [error, setError] = useState<string | undefined>('');

    const importLink = async () => {
        if (!data) {
            return;
        }

        if (isDirty) {
            if (!(await confirmUnsavedChanges())) {
                return;
            }
        }

        const scene = decodeScene(data);
        if (!scene) {
            setError(t('share.invalidLink'));
            return;
        }

        loadScene(scene);
        dismissDialog();
    };

    const onChange = (ev: ChangeEvent<HTMLTextAreaElement>, data: TextareaOnChangeData) => {
        setData(data.value);
        setError(undefined);
    };

    const onKeyUp = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            importLink();
        }
    };

    return (
        <>
            <Field
                label={t('share.enterLinkLabel')}
                validationState={error ? 'error' : 'none'}
                validationMessage={error}
            >
                <Textarea rows={4} onChange={onChange} onKeyUp={onKeyUp} />
            </Field>

            {renderModal()}

            <InPortal node={actions}>
                <DialogActions>
                    <Button appearance="primary" disabled={!data} onClick={importLink}>
                        {t('share.import')}
                    </Button>
                    <DialogTrigger>
                        <Button>{t('actions.cancel')}</Button>
                    </DialogTrigger>
                </DialogActions>
            </InPortal>
        </>
    );
};
function tryCovertGameStrategyBoardString(str: string): Scene | undefined {
    if (str.includes('stgy:a')) {
        // Try to extract game strategy board string from within larger text
        str = str.replace('stgy:a', '');
        const validChars = Object.keys(FORWARD_TRANSLATION_TABLE);
        str = str
            .split('')
            .filter((char) => validChars.includes(char))
            .join('');
        str = STRATEGY_BOARD_PREFIX + str + STRATEGY_BOARD_SUFFIX;
    } else {
        throw null;
    }

    try {
        const strategyBoardData = decodeGameStrategyBoardString(str);
        if (strategyBoardData) {
            return strategyBoardToScene(strategyBoardData);
        }
    } catch (ex) {
        console.error('Invalid game strategy board data', ex);
    }

    return undefined;
}

function decodeScene(str: string): Scene | undefined {
    const text = str.trim();

    try {
        return tryCovertGameStrategyBoardString(text);
    } catch (ex) {
        console.error('Error converting game strategy board string', ex);
    }

    try {
        return parseSceneLink(new URL(text));
    } catch (ex) {
        if (!(ex instanceof TypeError)) {
            console.error('Invalid plan data', ex);
        }
    }

    // Not a URL or game strategy board string. Try as plan data.
    try {
        return textToScene(decodeURIComponent(text));
    } catch (ex) {
        console.error('Invalid plan data', ex);
    }
    return undefined;
}
