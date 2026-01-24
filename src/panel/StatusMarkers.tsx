import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    MarkerAttack1Prefab,
    MarkerAttack2Prefab,
    MarkerAttack3Prefab,
    MarkerAttack4Prefab,
    MarkerAttack5Prefab,
    MarkerAttack6Prefab,
    MarkerAttack7Prefab,
    MarkerAttack8Prefab,
    MarkerBind1Prefab,
    MarkerBind2Prefab,
    MarkerBind3Prefab,
    MarkerCirclePrefab,
    MarkerCrossPrefab,
    MarkerIgnore1Prefab,
    MarkerIgnore2Prefab,
    MarkerSquarePrefab,
    MarkerTrianglePrefab,
} from '../prefabs/indicator/IndicatorMarker';
import { useControlStyles } from '../useControlStyles';
import { ObjectGroup, Section } from './Section';

export const StatusMarkers: React.FC = () => {
    const classes = useControlStyles();
    const { t } = useTranslation();

    return (
        <div className={classes.panel}>
            <Section title={t('icons.target')}>
                <ObjectGroup>
                    <MarkerAttack1Prefab />
                    <MarkerAttack2Prefab />
                    <MarkerAttack3Prefab />
                    <MarkerAttack4Prefab />
                </ObjectGroup>
                <ObjectGroup>
                    <MarkerAttack5Prefab />
                    <MarkerAttack6Prefab />
                    <MarkerAttack7Prefab />
                    <MarkerAttack8Prefab />
                </ObjectGroup>
                <ObjectGroup>
                    <MarkerIgnore1Prefab />
                    <MarkerIgnore2Prefab />
                    <MarkerBind1Prefab />
                    <MarkerBind2Prefab />
                    <MarkerBind3Prefab />
                </ObjectGroup>
                <ObjectGroup>
                    <MarkerTrianglePrefab />
                    <MarkerCirclePrefab />
                    <MarkerCrossPrefab />
                    <MarkerSquarePrefab />
                </ObjectGroup>
            </Section>
        </div>
    );
};
