import { Text } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { HotkeyName } from '../HotkeyName';
import { AoeArcPrefab } from '../prefabs/aoe/AoeArc';
import { AoeCirclePrefab } from '../prefabs/aoe/AoeCircle';
import { AoeDonutPrefab } from '../prefabs/aoe/AoeDonut';
import { AoeFanPrefab } from '../prefabs/aoe/AoeFan';
import { AoeLinePrefab } from '../prefabs/aoe/AoeLine';
import { AoePolygonPrefab } from '../prefabs/aoe/AoePolygon';
import { AoeRectPrefab } from '../prefabs/aoe/AoeRect';
import { AoeStarburstPrefab } from '../prefabs/aoe/AoeStarburst';
import { MarkerArrow } from '../prefabs/Arrow';
import '../prefabs/BoardIcon';
import { EnemyCircle, EnemyHuge, EnemyLarge, EnemyMedium, EnemySmall } from '../prefabs/Enemies';
import { IndicatorLineStackPrefab } from '../prefabs/indicator/IndicatorLineStack';
import {
    MarkerHighlightCirclePrefab,
    MarkerHighlightCrossPrefab,
    MarkerHighlightSquarePrefab,
    MarkerHighlightTrianglePrefab,
    MarkerTargetingBluePrefab,
    MarkerTargetingGreenPrefab,
    MarkerTargetingPurplePrefab,
    MarkerTargetingRedPrefab,
} from '../prefabs/indicator/IndicatorMarker';
import { IndicatorProximityPrefab } from '../prefabs/indicator/IndicatorProximity';
import { IndicatorStackPrefab } from '../prefabs/indicator/IndicatorStack';
import { IndicatorTankbusterPrefab } from '../prefabs/indicator/IndicatorTankbuster';
import { IndicatorTargetingPrefab } from '../prefabs/indicator/IndicatorTargeting';
import { MechCircleExaflarePrefab } from '../prefabs/mech/MechCircleExaflare';
import { MechCounterTowerPrefab } from '../prefabs/mech/MechCounterTower';
import '../prefabs/mech/MechGaze';
import { MechGazePrefab } from '../prefabs/mech/MechGaze';
import { MechLinearKnockbackPrefab } from '../prefabs/mech/MechLinearKnockback';
import { MechProximityPrefab } from '../prefabs/mech/MechProximity';
import { MechRadialKnockbackPrefab } from '../prefabs/mech/MechRadialKnockback';
import { MechAnticlockwiseRotationPrefab, MechClockwiseRotationPrefab } from '../prefabs/mech/MechRotation';
import { MechTowerPrefab } from '../prefabs/mech/MechTower';
import {
    PartyAllRole,
    PartyAny,
    PartyBarrierHealer,
    PartyDps,
    PartyDps1,
    PartyDps2,
    PartyDps3,
    PartyDps4,
    PartyHealer,
    PartyHealer1,
    PartyHealer2,
    PartyHealerDps,
    PartyMagicalRanged,
    PartyMelee,
    PartyMelee1,
    PartyMelee2,
    PartyPhysicalRanged,
    PartyPureHealer,
    PartyRanged,
    PartyRanged1,
    PartyRanged2,
    PartyTank,
    PartyTank1,
    PartyTank2,
    PartyTankDps,
    PartyTankHealer,
} from '../prefabs/Party';
import {
    TetherClose,
    TetherFar,
    TetherLine,
    TetherMinusMinus,
    TetherPlusMinus,
    TetherPlusPlus,
} from '../prefabs/Tethers';
import { TextLabel } from '../prefabs/TextLabel';
import { Waymark1, Waymark2, Waymark3, Waymark4, WaymarkA, WaymarkB, WaymarkC, WaymarkD } from '../prefabs/Waymark';
import { ZoneArc } from '../prefabs/zone/ZoneArc';
import { ZoneCircle } from '../prefabs/zone/ZoneCircle';
import { ZoneDonut } from '../prefabs/zone/ZoneDonut';
import { ZoneFan } from '../prefabs/zone/ZoneFan';
import { ZoneLine } from '../prefabs/zone/ZoneLine';
import { ZonePolygon } from '../prefabs/zone/ZonePolygon';
import { ZoneRectangle } from '../prefabs/zone/ZoneRectangle';
import { ZoneRightTriangle } from '../prefabs/zone/ZoneRightTriangle';
import { ZoneStarburst } from '../prefabs/zone/ZoneStarburst';
import { ZoneTriangle } from '../prefabs/zone/ZoneTriangle';
import { useControlStyles } from '../useControlStyles';
import { ObjectGroup, Section } from './Section';

export const PrefabsPanel: React.FC = () => {
    const controlClasses = useControlStyles();
    const { t } = useTranslation();

    return (
        <div className={controlClasses.panel}>
            <ObjectGroup>
                <TextLabel />
                <MarkerArrow />
            </ObjectGroup>
            <Section title={t('prefabs.shape')}>
                <ObjectGroup>
                    <ZoneRectangle />
                    <ZoneLine />
                    <ZoneCircle />
                    <ZoneDonut />
                    <ZoneFan />
                    <ZoneArc />

                    <ZoneTriangle />
                    <ZoneRightTriangle />
                    <ZonePolygon />
                    <ZoneStarburst />
                </ObjectGroup>
            </Section>
            <Section title={t('prefabs.aoe')}>
                <ObjectGroup>
                    <AoeRectPrefab />
                    <AoeLinePrefab />
                    <AoeCirclePrefab />
                    <AoeDonutPrefab />
                    <AoeFanPrefab />
                    <AoeArcPrefab />

                    <AoePolygonPrefab />
                    <AoeStarburstPrefab />
                </ObjectGroup>
            </Section>
            <Section title={t('prefabs.mechanic')}>
                <ObjectGroup>
                    <MechGazePrefab />
                    <MechProximityPrefab />
                    <MechRadialKnockbackPrefab />
                    <MechLinearKnockbackPrefab />
                    <MechTowerPrefab />
                    <MechCounterTowerPrefab />
                    <MechCircleExaflarePrefab />
                    <MechClockwiseRotationPrefab />
                    <MechAnticlockwiseRotationPrefab />
                </ObjectGroup>
            </Section>
            <Section title={t('prefabs.indicator')}>
                <ObjectGroup>
                    <IndicatorStackPrefab />
                    <IndicatorLineStackPrefab />
                    <IndicatorProximityPrefab />
                    <IndicatorTankbusterPrefab />
                    <IndicatorTargetingPrefab />
                </ObjectGroup>
                <ObjectGroup>
                    <MarkerTargetingRedPrefab />
                    <MarkerTargetingBluePrefab />
                    <MarkerTargetingPurplePrefab />
                    <MarkerTargetingGreenPrefab />
                </ObjectGroup>
                <ObjectGroup>
                    <MarkerHighlightCirclePrefab />
                    <MarkerHighlightCrossPrefab />
                    <MarkerHighlightSquarePrefab />
                    <MarkerHighlightTrianglePrefab />
                </ObjectGroup>
            </Section>
            <Section title={t('prefabs.waymark')}>
                <ObjectGroup>
                    <WaymarkA />
                    <WaymarkB />
                    <WaymarkC />
                    <WaymarkD />
                </ObjectGroup>
                <ObjectGroup>
                    <Waymark1 />
                    <Waymark2 />
                    <Waymark3 />
                    <Waymark4 />
                </ObjectGroup>
            </Section>
            <Section title={t('prefabs.party')}>
                <ObjectGroup>
                    <PartyAny />
                    <PartyAllRole />
                    <PartyTankHealer />
                    <PartyTankDps />
                    <PartyHealerDps />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyTank />
                    <PartyTank1 />
                    <PartyTank2 />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyHealer />
                    <PartyHealer1 />
                    <PartyHealer2 />
                    <PartyPureHealer />
                    <PartyBarrierHealer />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyDps1 />
                    <PartyDps2 />
                    <PartyDps3 />
                    <PartyDps4 />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyMelee1 />
                    <PartyMelee2 />
                    <PartyRanged1 />
                    <PartyRanged2 />
                </ObjectGroup>

                <ObjectGroup>
                    <PartyDps />
                    <PartyMelee />
                    <PartyRanged />
                    <PartyPhysicalRanged />
                    <PartyMagicalRanged />
                </ObjectGroup>
            </Section>

            <Section title={t('prefabs.enemy')}>
                <ObjectGroup>
                    <EnemyCircle />
                    <EnemySmall />
                    <EnemyMedium />
                    <EnemyLarge />
                    <EnemyHuge />
                </ObjectGroup>
            </Section>
            <Section title={t('prefabs.tether')}>
                <ObjectGroup>
                    <TetherLine />
                    <TetherClose />
                    <TetherFar />

                    <TetherPlusMinus />
                    <TetherPlusPlus />
                    <TetherMinusMinus />
                </ObjectGroup>
                <Text block size={200} data-nosnippet>
                    {t('prefabs.tetherHelp.part1')} <HotkeyName keys="esc" /> {t('prefabs.tetherHelp.part2')}{' '}
                    <HotkeyName keys="ctrl" /> {t('prefabs.tetherHelp.part3')}
                </Text>
            </Section>
        </div>
    );
};
