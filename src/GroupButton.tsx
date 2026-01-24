import { makeStyles, ToolbarButtonProps } from '@fluentui/react-components';
import { DismissRegular, GroupRegular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsableToolbarButton } from './CollapsableToolbarButton';
import { groupSelectedObjects, ungroupSelectedObjects } from './lib/group';
import { useCurrentStep, useScene } from './SceneProvider';
import { getSelectedObjects, useSelection } from './selection';

const useStyles = makeStyles({
    button: {
        minWidth: 'auto',
    },
});

export type GroupButtonProps = ToolbarButtonProps;

export const GroupButton: React.FC<GroupButtonProps> = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { dispatch } = useScene();
    const [selection] = useSelection();
    const step = useCurrentStep();

    let actionType: 'group' | 'ungroup' | 'none' = 'none';
    let disabled = true;
    let icon: React.ReactNode = <GroupRegular />;

    const selectedObjects = getSelectedObjects(step, selection);

    if (selectedObjects.length <= 0) {
        actionType = 'none';
        disabled = true;
        icon = <GroupRegular />;
    } else if (selectedObjects.length === 1) {
        const obj = selectedObjects[0];
        if (obj && obj.groupId) {
            actionType = 'ungroup';
            disabled = false;
            icon = <DismissRegular />;
        } else {
            actionType = 'none';
            disabled = true;
            icon = <GroupRegular />;
        }
    } else {
        const groupIds = selectedObjects.map((obj) => obj.groupId).filter((groupId) => !!groupId);
        const uniqueGroupIds = new Set(groupIds);
        if (uniqueGroupIds.size === 1 && groupIds.length === selectedObjects.length) {
            // 选中的元素都是同一组，应显示【解除编组】按钮，点击后会把选中的元素从组中移除
            actionType = 'ungroup';
            disabled = false;
            icon = <DismissRegular />;
        } else {
            // 选中的元素不都是同一组，应显示【编组】按钮，点击后会把选中的元素编组
            actionType = 'group';
            disabled = false;
            icon = <GroupRegular />;
        }
    }

    const handleClick = () => {
        if (disabled || actionType === 'none') {
            return;
        }

        if (actionType === 'group') {
            groupSelectedObjects(step, selection, dispatch);
        } else {
            ungroupSelectedObjects(step, selection, dispatch);
        }
    };

    const buttonText = actionType === 'ungroup' ? t('toolbar.ungroup') : t('toolbar.group');

    return (
        <CollapsableToolbarButton
            {...props}
            className={classes.button}
            onClick={handleClick}
            disabled={disabled}
            icon={icon}
        >
            {buttonText}
        </CollapsableToolbarButton>
    );
};
