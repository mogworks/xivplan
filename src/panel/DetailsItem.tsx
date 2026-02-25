import { Button, makeStyles, mergeClasses, tokens, typographyStyles } from '@fluentui/react-components';
import {
    bundleIcon,
    DismissFilled,
    DismissRegular,
    EyeFilled,
    EyeOffFilled,
    EyeOffRegular,
    EyeRegular,
    GroupRegular,
    LockClosedRegular,
    LockOpenRegular,
} from '@fluentui/react-icons';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../SceneProvider';
import { PrefabIcon } from '../prefabs/PrefabIcon';
import { isMovable, MovableObject, SceneObject } from '../scene';
import { selectGroupElements, useSelection } from '../selection';
import { setOrOmit } from '../util';
import { detailsItemClassNames } from './detailsItemStyles';

export interface DetailsItemProps {
    object: SceneObject;
    icon?: string | ReactNode;
    name: string;
    children?: ReactNode;
    isNested?: boolean;
    isDragging?: boolean;
    isSelected?: boolean;
}

// Generate a consistent color from a group ID
function getGroupColor(groupId: string): string {
    let hash = 0;
    for (let i = 0; i < groupId.length; i++) {
        hash = groupId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

// TODO: only show hide button if hidden or hovered/selected

export const DetailsItem: React.FC<DetailsItemProps> = ({
    object,
    icon,
    name,
    isNested,
    isDragging,
    isSelected,
    children,
}) => {
    const classes = useStyles();

    const size = isNested ? 20 : undefined;

    return (
        <div className={mergeClasses(classes.wrapper, isNested && classes.nested)}>
            <div>{icon && <PrefabIcon icon={icon} name={name} width={size} height={size} />}</div>
            {children ? children : <div className={classes.name}>{name}</div>}
            {!isNested && (
                <div className={classes.buttons}>
                    <DetailsItemGroupButton
                        object={object}
                        className={mergeClasses(isSelected && classes.selectedButton)}
                    />
                    {isMovable(object) && (
                        <DetailsItemPinnedButton
                            object={object}
                            className={mergeClasses(isSelected && classes.selectedButton)}
                        />
                    )}
                    <DetailsItemHideButton
                        object={object}
                        className={mergeClasses(isSelected && classes.selectedButton, isDragging && classes.visible)}
                    />
                    <DetailsItemDeleteButton
                        object={object}
                        className={mergeClasses(isSelected && classes.selectedButton)}
                    />
                </div>
            )}
        </div>
    );
};

interface DetailsItemPinnedButtonProps {
    object: SceneObject & MovableObject;
    className?: string;
}

const DetailsItemGroupButton: React.FC<{ object: SceneObject; className?: string }> = ({ object, className }) => {
    const classes = useStyles();
    const { step } = useScene();
    const [, setSelection] = useSelection();
    const { t } = useTranslation();

    if (!object.groupId) {
        return null;
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const newSelection = selectGroupElements(step, object);
        setSelection(newSelection);
        e.stopPropagation();
    };

    const color = getGroupColor(object.groupId);

    return (
        <Button
            appearance="transparent"
            className={mergeClasses(classes.button, className)}
            icon={<GroupRegular />}
            onClick={handleClick}
            title={t('properties.selectGroup')}
            style={{ color }}
        />
    );
};

const DetailsItemPinnedButton: React.FC<DetailsItemPinnedButtonProps> = ({ object, className }) => {
    const classes = useStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        dispatch({ type: 'update', value: setOrOmit(object, 'pinned', !object.pinned) });
        e.stopPropagation();
    };

    const Icon = object.pinned ? <LockClosedRegular /> : <LockOpenRegular />;
    const tooltip = object.pinned ? t('properties.unlockPosition') : t('properties.lockPosition');

    return (
        <Button
            appearance="transparent"
            className={mergeClasses(classes.button, className)}
            icon={Icon}
            onClick={handleClick}
            title={tooltip}
        />
    );
};

interface DetailsItemHideButtonProps {
    object: SceneObject;
    className?: string;
}

const GazeOffIcon = bundleIcon(EyeOffFilled, EyeOffRegular);
const GazeIcon = bundleIcon(EyeFilled, EyeRegular);

const DetailsItemHideButton: React.FC<DetailsItemHideButtonProps> = ({ object, className }) => {
    const classes = useStyles();
    const { dispatch } = useScene();
    const { t } = useTranslation();
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        dispatch({ type: 'update', value: setOrOmit(object, 'hide', !object.hide) });
        e.stopPropagation();
    };

    const Icon = object.hide ? GazeOffIcon : GazeIcon;
    const tooltip = object.hide ? t('properties.show') : t('properties.hide');

    return (
        <Button
            appearance="transparent"
            className={mergeClasses(
                detailsItemClassNames.hideButton,
                classes.hideButton,
                classes.button,
                object.hide && classes.visible,
                className,
            )}
            icon={<Icon />}
            onClick={handleClick}
            title={tooltip}
        />
    );
};

interface DetailsItemDeleteButtonProps {
    object: SceneObject;
    className?: string;
}

const DeleteIcon = bundleIcon(DismissFilled, DismissRegular);

const DetailsItemDeleteButton: React.FC<DetailsItemDeleteButtonProps> = ({ object, className }) => {
    const classes = useStyles();
    const { dispatch } = useScene();
    const deleteObject = () => dispatch({ type: 'remove', ids: object.id });

    return (
        <Button
            appearance="transparent"
            className={mergeClasses(classes.button, className)}
            icon={<DeleteIcon />}
            onClick={deleteObject}
            title="Delete object"
        />
    );
};

const useStyles = makeStyles({
    wrapper: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        padding: tokens.spacingHorizontalXXS,
        gap: tokens.spacingHorizontalS,

        [`:hover .${detailsItemClassNames.hideButton}`]: {
            opacity: 1,
        },
    },

    name: {
        flexGrow: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },

    nested: {
        gap: tokens.spacingHorizontalXS,
        ...typographyStyles.caption1,
    },

    buttons: {
        display: 'flex',
        flexFlow: 'row',
        gap: tokens.spacingHorizontalXXS,
    },

    button: {
        padding: '0 0',
        minWidth: 'unset',
    },

    hideButton: {
        opacity: 1,
        transitionProperty: 'opacity',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,
    },

    visible: {
        opacity: 1,
    },

    selectedButton: {
        color: tokens.colorNeutralForegroundOnBrand,

        ':hover': {
            color: tokens.colorNeutralForegroundOnBrand,
        },
    },
});
