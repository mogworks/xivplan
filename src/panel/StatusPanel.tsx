import { Tab, TabList, makeStyles } from '@fluentui/react-components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TabActivity } from '../TabActivity';
import { StatusMarkers } from './StatusMarkers';
import { StatusSearch } from './StatusSearch';

type Tabs = 'marker' | 'status';

export const StatusPanel: React.FC = () => {
    const classes = useStyles();
    const [tab, setTab] = useState<Tabs>('marker');
    const { t } = useTranslation();

    return (
        <div className={classes.panel}>
            <TabList size="small" selectedValue={tab} onTabSelect={(ev, data) => setTab(data.value as Tabs)}>
                <Tab value="marker">{t('status.markers')}</Tab>
                <Tab value="status">{t('status.effects')}</Tab>
            </TabList>
            <TabActivity value="marker" activeTab={tab}>
                <StatusMarkers />
            </TabActivity>
            <TabActivity value="status" activeTab={tab}>
                <StatusSearch />
            </TabActivity>
        </div>
    );
};

const useStyles = makeStyles({
    panel: {
        height: '100%',
        display: 'flex',
        flexFlow: 'column',
        overflow: 'hidden',
    },
});
