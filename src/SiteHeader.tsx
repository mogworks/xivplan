import {
    Button,
    Link,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Text,
    Tooltip,
    makeStyles,
    mergeClasses,
    tokens,
} from '@fluentui/react-components';
import { LocalLanguageFilled, WeatherMoonFilled, WeatherSunnyFilled } from '@fluentui/react-icons';
import React, { HTMLAttributes, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { OutPortal } from 'react-reverse-portal';
import { AboutDialog } from './AboutDialog';
import { AccountMenu } from './AccountMenu';
import { ExternalLink } from './ExternalLink';
import { HelpContext } from './HelpContext';
import { PANEL_WIDTH } from './panel/PanelStyles';
import { FileSource, useScene } from './SceneProvider';
import { DarkModeContext } from './ThemeContext';
import { ToolbarContext } from './ToolbarContext';
import { useIsDirty } from './useIsDirty';
import { removeFileExtension } from './util';

const GAP = tokens.spacingHorizontalL;
const HEADER_HEIGHT = '48px';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        columnGap: GAP,
        minHeight: HEADER_HEIGHT,
        paddingInlineEnd: tokens.spacingHorizontalS,
    },
    title: {
        display: 'flex',
        alignItems: 'baseline',
        boxSizing: 'border-box',
        paddingLeft: tokens.spacingHorizontalM,
        gap: GAP,
        width: `calc(${PANEL_WIDTH}px - ${GAP})`,
        textDecoration: 'none',
    },
    source: {
        display: 'inline-flex',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    filename: {
        color: tokens.colorNeutralForeground3,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    dirty: {
        paddingInlineStart: tokens.spacingHorizontalXS,
    },
    commandBar: {
        flexGrow: 1,
    },
    link: {
        color: tokens.colorNeutralForeground2,
    },
    toggleLabel: {
        color: tokens.colorNeutralForeground2,
        fontWeight: 500,
    },
    iconButton: {
        minWidth: '40px',
        width: '40px',
    },
    buttonGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    activeLanguageItem: {
        color: tokens.colorBrandForeground1,
        fontWeight: 600,
    },
});

export const SiteHeader: React.FC<HTMLAttributes<HTMLElement>> = ({ className, ...props }) => {
    const classes = useStyles();
    const { source } = useScene();
    const toolbarNode = useContext(ToolbarContext);
    const [, setHelpOpen] = useContext(HelpContext);
    const [darkMode, setDarkMode] = useContext(DarkModeContext);
    const { t, i18n } = useTranslation();

    const titleSize = source ? 400 : 500;

    return (
        <header className={mergeClasses(classes.root, className)} {...props}>
            <div className={classes.title}>
                <Text size={titleSize} weight="semibold">
                    XIVPlan
                </Text>
                {source && <SourceIndicator source={source} />}
            </div>
            <div className={classes.commandBar}>
                <OutPortal node={toolbarNode} />
            </div>

            <Link onClick={() => setHelpOpen(true)} className={classes.link}>
                {t('header.help')}
            </Link>
            <AboutDialog className={classes.link} />
            <ExternalLink className={classes.link} href="https://github.com/mogworks/xivplan" noIcon>
                {t('header.github')}
            </ExternalLink>
            <div className={classes.buttonGroup}>
                <Menu>
                    <MenuTrigger disableButtonEnhancement>
                        <Button appearance="subtle" className={classes.iconButton} icon={<LocalLanguageFilled />} />
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            <MenuItem
                                onClick={() => i18n.changeLanguage('zh')}
                                className={i18n.language === 'zh' ? classes.activeLanguageItem : undefined}
                            >
                                {t('header.language_zh')}
                            </MenuItem>
                            <MenuItem
                                onClick={() => i18n.changeLanguage('en')}
                                className={i18n.language === 'en' ? classes.activeLanguageItem : undefined}
                            >
                                {t('header.language_en')}
                            </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
                <Button
                    appearance="subtle"
                    className={classes.iconButton}
                    icon={darkMode ? <WeatherSunnyFilled /> : <WeatherMoonFilled />}
                    onClick={() => setDarkMode(!darkMode)}
                />
                <AccountMenu />
            </div>
        </header>
    );
};

interface SourceIndicatorProps {
    source: FileSource;
}

const SourceIndicator: React.FC<SourceIndicatorProps> = ({ source }) => {
    const classes = useStyles();
    const isDirty = useIsDirty();
    const { t } = useTranslation();
    const tooltip = isDirty ? t('header.unsavedChangesTooltip', { name: source.name }) : source.name;

    return (
        <Tooltip content={tooltip} relationship="description">
            <span className={classes.source}>
                <Text className={classes.filename}>{removeFileExtension(source.name)}</Text>
                {isDirty && <Text className={classes.dirty}>●</Text>}
            </span>
        </Tooltip>
    );
};
