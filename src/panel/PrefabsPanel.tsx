import { Text } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { HotkeyName } from '../HotkeyName';
import { AoeArcPrefab } from '../prefabs/aoe/AoeArc';
import { AoeCirclePrefab } from '../prefabs/aoe/AoeCircle';
import { AoeConePrefab } from '../prefabs/aoe/AoeCone';
import { AoeDonutPrefab } from '../prefabs/aoe/AoeDonut';
import { AoeLinePrefab } from '../prefabs/aoe/AoeLine';
import { AoeRectPrefab } from '../prefabs/aoe/AoeRect';
import { MarkerArrow } from '../prefabs/Arrow';
import '../prefabs/BoardIcon';
import { EnemyCircle, EnemyHuge, EnemyLarge, EnemyMedium, EnemySmall } from '../prefabs/Enemies';
import '../prefabs/mechanic/MechEye';
import { MechEyePrefab } from '../prefabs/mechanic/MechEye';
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
import { ZoneCone } from '../prefabs/zone/ZoneCone';
import { ZoneDonut } from '../prefabs/zone/ZoneDonut';
import { ZoneExaflare } from '../prefabs/zone/ZoneExaflare';
import { ZoneKnockback } from '../prefabs/zone/ZoneKnockback';
import { ZoneLine } from '../prefabs/zone/ZoneLine';
import { ZoneLineKnockAway } from '../prefabs/zone/ZoneLineKnockAway';
import { ZoneLineKnockback } from '../prefabs/zone/ZoneLineKnockback';
import { ZoneLineStack } from '../prefabs/zone/ZoneLineStack';
import { ZonePolygon } from '../prefabs/zone/ZonePolygon';
import { ZoneProximity } from '../prefabs/zone/ZoneProximity';
import { ZoneRectangle } from '../prefabs/zone/ZoneRectangle';
import { ZoneRightTriangle } from '../prefabs/zone/ZoneRightTriangle';
import { ZoneRotateClockwise, ZoneRotateCounterClockwise } from '../prefabs/zone/ZoneRotate';
import { ZoneStack } from '../prefabs/zone/ZoneStack';
import { ZoneStarburst } from '../prefabs/zone/ZoneStarburst';
import { ZoneTower } from '../prefabs/zone/ZoneTower';
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
                    <ZoneCone />
                    <ZoneArc />

                    <ZoneTriangle />
                    <ZoneRightTriangle />
                    <ZonePolygon />
                </ObjectGroup>
            </Section>
            <Section title={t('prefabs.aoe')}>
                <ObjectGroup>
                    <AoeRectPrefab />
                    <AoeLinePrefab />
                    <AoeCirclePrefab />
                    <AoeDonutPrefab />
                    <AoeConePrefab />
                    <AoeArcPrefab />
                </ObjectGroup>
            </Section>
            <Section title={t('prefabs.mechanic')}>
                <ObjectGroup>
                    <ZoneLineKnockback />
                    <ZoneLineKnockAway />
                    <ZoneKnockback />
                    <ZoneProximity />
                    <ZoneExaflare />
                    <ZoneStarburst />

                    <ZoneStack />
                    <ZoneLineStack />
                    <ZoneRotateClockwise />
                    <ZoneRotateCounterClockwise />
                    <ZoneTower />
                    <MechEyePrefab />
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
