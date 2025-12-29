import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { ObjectType, PartyObject } from '../scene';
import { DEFAULT_PARTY_OPACITY } from '../theme';
import { useImageTracked } from '../useObjectLoading';
import { usePanelDrag } from '../usePanelDrag';
import { makeDisplayName } from '../util';
import { HideGroup } from './HideGroup';
import { useHighlightProps } from './highlight';
import { getPartyIconUrl, PartyIcons } from './partyIcon';
import { PrefabIcon } from './PrefabIcon';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';

const DEFAULT_SIZE = 32;

function makeIcon(iconId: number) {
    const nameKey = `boardIcon.${iconId}`;
    const Component: React.FC = () => {
        const [, setDragObject] = usePanelDrag();

        const iconUrl = getPartyIconUrl(iconId);
        const { t } = useTranslation();
        const label = t(nameKey, { defaultValue: import.meta.env.DEV ? iconId : '' });

        return (
            <PrefabIcon
                draggable
                name={label}
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.Party,
                            iconId,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
    Component.displayName = makeDisplayName(nameKey);
    return Component;
}

registerDropHandler<PartyObject>(ObjectType.Party, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Party,
            name: '',
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            opacity: DEFAULT_PARTY_OPACITY,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const PartyRenderer: React.FC<RendererProps<PartyObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(getPartyIconUrl(object.iconId));

    return (
        <ResizeableObjectContainer object={object} transformerProps={{ centeredScaling: true }}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {highlightProps && (
                        <Rect
                            width={object.width}
                            height={object.height}
                            cornerRadius={(object.width + object.height) / 2 / 5}
                            {...highlightProps}
                        />
                    )}
                    <HideGroup>
                        <Image
                            image={image}
                            width={object.width}
                            height={object.height}
                            opacity={object.opacity / 100}
                        />
                    </HideGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<PartyObject>(ObjectType.Party, LayerName.Default, PartyRenderer);

const PartyDetails: React.FC<ListComponentProps<PartyObject>> = ({ object, ...props }) => {
    const { t } = useTranslation();
    const name = object.name || t(`boardIcon.${object.iconId}`, { defaultValue: object.iconId });
    return <DetailsItem icon={getPartyIconUrl(object.iconId)} name={name} object={object} {...props} />;
};

registerListComponent<PartyObject>(ObjectType.Party, PartyDetails);

export const PartyAny = makeIcon(PartyIcons.Any);
export const PartyAllRole = makeIcon(PartyIcons.AllRole);
export const PartyTankHealer = makeIcon(PartyIcons.TH);
export const PartyTankDps = makeIcon(PartyIcons.TD);
export const PartyHealerDps = makeIcon(PartyIcons.HD);

export const PartyTank = makeIcon(PartyIcons.Tank);
export const PartyPaladin = makeIcon(PartyIcons.PLD);
export const PartyWarrior = makeIcon(PartyIcons.WAR);
export const PartyDarkKnight = makeIcon(PartyIcons.DRK);
export const PartyGunbreaker = makeIcon(PartyIcons.GNB);

export const PartyHealer = makeIcon(PartyIcons.Healer);
export const PartyWhiteMage = makeIcon(PartyIcons.WHM);
export const PartyScholar = makeIcon(PartyIcons.SCH);
export const PartyAstrologian = makeIcon(PartyIcons.AST);
export const PartySage = makeIcon(PartyIcons.SGE);

export const PartyDps = makeIcon(PartyIcons.DPS);
export const PartyMelee = makeIcon(PartyIcons.Melee);
export const PartyRanged = makeIcon(PartyIcons.Ranged);
export const PartyPhysicalRanged = makeIcon(PartyIcons.PhysicalRanged);
export const PartyMagicalRanged = makeIcon(PartyIcons.MagicalRanged);

export const PartyMonk = makeIcon(PartyIcons.MNK);
export const PartyDragoon = makeIcon(PartyIcons.DRG);
export const PartyNinja = makeIcon(PartyIcons.NIN);
export const PartySamurai = makeIcon(PartyIcons.SAM);
export const PartyReaper = makeIcon(PartyIcons.RPR);
export const PartyViper = makeIcon(PartyIcons.VPR);

export const PartyBard = makeIcon(PartyIcons.BRD);
export const PartyMachinist = makeIcon(PartyIcons.MCH);
export const PartyDancer = makeIcon(PartyIcons.DNC);

export const PartyBlackMage = makeIcon(PartyIcons.BLM);
export const PartySummoner = makeIcon(PartyIcons.SMN);
export const PartyRedMage = makeIcon(PartyIcons.RDM);
export const PartyPictomancer = makeIcon(PartyIcons.PCT);
export const PartyBlueMage = makeIcon(PartyIcons.BLU);
