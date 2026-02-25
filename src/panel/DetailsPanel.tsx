import { Divider, makeStyles, mergeClasses, Tab, TabList, typographyStyles } from '@fluentui/react-components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMedia } from 'react-use';
import { TabActivity } from '../TabActivity';
import { useControlStyles } from '../useControlStyles';
import { PANEL_PADDING, PANEL_WIDTH, WIDE_PANEL_WIDTH } from './PanelStyles';
import { PropertiesPanel } from './PropertiesPanel';
import { SceneObjectsPanel } from './SceneObjectsPanel';

export const DetailsPanel: React.FC = () => {
    const isWide = useMedia(`(min-width: 1700px)`);

    if (isWide) {
        return <WideDetailsPanel />;
    }

    return <ShortDetailsPanel />;
};

const WideDetailsPanel: React.FC = () => {
    const classes = useStyles();
    const controlClasses = useControlStyles();
    const { t } = useTranslation();

    return (
        <div className={classes.widePanel}>
            <section className={classes.section}>
                <header className={classes.header}>{t('helpDialog.properties')}</header>
                <div className={classes.scrollable}>
                    <PropertiesPanel />
                </div>
            </section>

            <Divider inset vertical className={controlClasses.divider} />

            <section className={mergeClasses(classes.section, classes.wideSection)}>
                <header className={classes.header}>{t('helpDialog.scene')}</header>
                <div className={classes.scrollable}>
                    <SceneObjectsPanel />
                </div>
            </section>
        </div>
    );
};

type Tabs = 'properties' | 'objects';

const ShortDetailsPanel: React.FC = () => {
    const classes = useStyles();
    const [tab, setTab] = useState<Tabs>('properties');
    const { t } = useTranslation();

    return (
        <div className={classes.wrapper}>
            <TabList selectedValue={tab} onTabSelect={(ev, data) => setTab(data.value as Tabs)}>
                <Tab value="properties">{t('helpDialog.properties')}</Tab>
                <Tab value="objects">{t('helpDialog.scene')}</Tab>
            </TabList>
            <TabActivity value="properties" activeTab={tab}>
                <PropertiesPanel className={classes.shortPanelContent} />
            </TabActivity>
            <TabActivity value="objects" activeTab={tab}>
                <SceneObjectsPanel className={classes.shortPanelContent} />
            </TabActivity>
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: {
        gridArea: 'right-panel',
        flexShrink: '0 !important',
        width: `${PANEL_WIDTH}px`,
    },

    widePanel: {
        display: 'flex',
        flexFlow: 'row',

        gridArea: 'right-panel',
        flexShrink: '0 !important',
        height: '100%',
    },

    header: {
        ...typographyStyles.subtitle2,
        padding: `0 ${PANEL_PADDING}px`,
    },

    section: {
        width: `${PANEL_WIDTH}px`,
        display: 'flex',
        flexFlow: 'column',
    },

    wideSection: {
        width: `${WIDE_PANEL_WIDTH}px`,
    },

    scrollable: {
        overflowY: 'auto',
    },

    shortPanelContent: {
        height: 'calc(100vh - 48px - 60px)',
        overflow: 'auto',
    },
});
