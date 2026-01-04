import { makeStyles } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from './Section';
import { StatusMarkers } from './StatusMarkers';
import { StatusSearch } from './StatusSearch';

export const StatusPanel: React.FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <div className={classes.panel}>
            <StatusMarkers />
            <Section title={t('status.effects')}>
                <StatusSearch />
            </Section>
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
