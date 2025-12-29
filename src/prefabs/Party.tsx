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
    const name = t(`boardIcon.${object.iconId}`, { defaultValue: object.iconId });
    return <DetailsItem icon={getPartyIconUrl(object.iconId)} name={name} object={object} {...props} />;
};

registerListComponent<PartyObject>(ObjectType.Party, PartyDetails);

export const PartyAny = makeIcon(PartyIcons.Any);
export const PartyAllRole = makeIcon(PartyIcons.AllRole);
export const PartyTankHealer = makeIcon(PartyIcons.TH);
export const PartyTankDps = makeIcon(PartyIcons.TD);
export const PartyHealerDps = makeIcon(PartyIcons.HD);

export const PartyTank = makeIcon(PartyIcons.Tank);
export const PartyTank1 = makeIcon(PartyIcons.Tank1);
export const PartyTank2 = makeIcon(PartyIcons.Tank2);

export const PartyHealer = makeIcon(PartyIcons.Healer);
export const PartyHealer1 = makeIcon(PartyIcons.Healer1);
export const PartyHealer2 = makeIcon(PartyIcons.Healer2);
export const PartyPureHealer = makeIcon(PartyIcons.PureHealer);
export const PartyBarrierHealer = makeIcon(PartyIcons.BarrierHealer);

export const PartyDps1 = makeIcon(PartyIcons.DPS1);
export const PartyDps2 = makeIcon(PartyIcons.DPS2);
export const PartyDps3 = makeIcon(PartyIcons.DPS3);
export const PartyDps4 = makeIcon(PartyIcons.DPS4);

export const PartyMelee1 = makeIcon(PartyIcons.Melee1);
export const PartyMelee2 = makeIcon(PartyIcons.Melee2);
export const PartyRanged1 = makeIcon(PartyIcons.Ranged1);
export const PartyRanged2 = makeIcon(PartyIcons.Ranged2);

export const PartyDps = makeIcon(PartyIcons.DPS);
export const PartyMelee = makeIcon(PartyIcons.Melee);
export const PartyRanged = makeIcon(PartyIcons.Ranged);
export const PartyPhysicalRanged = makeIcon(PartyIcons.PhysicalRanged);
export const PartyMagicalRanged = makeIcon(PartyIcons.MagicalRanged);
