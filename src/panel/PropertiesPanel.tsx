import { mergeClasses } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentStep } from '../SceneProvider';
import {
    SceneObject,
    UnknownObject,
    isArrow,
    isAsset,
    isBoardIcon,
    isColored,
    isDrawObject,
    isExaflareZone,
    isExtendable,
    isFanLike,
    isGaze,
    isIcon,
    isImageObject,
    isIndicatorStack,
    isInnerRadiusObject,
    isLineLike,
    isMechCircleExaflare,
    isMechGaze,
    isMovable,
    isNamed,
    isParty,
    isPolygonLike,
    isRadiusObject,
    isRegularResizable,
    isResizable,
    isRotatable,
    isStarburstLike,
    isTarget,
    isTether,
    isText,
    isWaymark,
    isWaymarkGroup,
    supportsHollow,
    supportsStackCount,
} from '../scene';
import { getSelectedObjects, useSelection } from '../selection';
import { useControlStyles } from '../useControlStyles';
import { PropertiesControlProps } from './PropertiesControl';
import { AoeEffectControls } from './properties/AoeEffectControls';
import { ArrowPointersControl } from './properties/ArrowControls';
import { FlipControl } from './properties/BoardIconControls';
import { DrawObjectBrushControl } from './properties/BrushControl';
import { ColorControl, ColorSwatchControl } from './properties/ColorControl';
import { ExaflareLengthControl, ExaflareSpacingControl } from './properties/ExaflareControls';
import { ExtendableControl } from './properties/ExtendableControls';
import { FanAngleControl } from './properties/FanControls';
import { GazeInvertControl } from './properties/GazeControls';
import { HideControl } from './properties/HideControl';
import { HollowControl } from './properties/HollowControl';
import { IconStacksControl, IconTimeControl } from './properties/IconControls';
import { ImageControl } from './properties/ImageControl';
import { LayerControl } from './properties/LayerControls';
import { LineSizeControl } from './properties/LineControls';
import { NameControl } from './properties/NameControl';
import { OpacityControl } from './properties/OpacityControl';
import { PartyIconControl } from './properties/PartyControls';
import { PolygonOrientationControl, PolygonSidesControl } from './properties/PolygonControls';
import { PositionControl } from './properties/PositionControl';
import { InnerRadiusControl, RadiusControl } from './properties/RadiusControl';
import { RotationControl } from './properties/RotationControl';
import { RegularSizeControl, SizeControl } from './properties/SizeControl';
import { StackMultiHitControl } from './properties/StackControls';
import { StackCountControl } from './properties/StackCountControl';
import { StarburstSpokeCountControl, StarburstSpokeWidthControl } from './properties/StarburstControls';
import { TargetRingControl } from './properties/TargetControls';
import { TetherTypeControl, TetherWidthControl } from './properties/TetherControls';
import { TextLayoutControl, TextOutlineControl, TextValueControl } from './properties/TextControls';
import { WaymarkGroupControl, WaymarkOpacityControl, WaymarkRotationControl } from './properties/WaymarkControls';

export interface PropertiesPanelProps {
    className?: string;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ className }) => {
    const classes = useControlStyles();

    return (
        <div className={mergeClasses(classes.panel, classes.column, className)}>
            <Controls />
        </div>
    );
};

interface ControlConditionProps {
    objects: readonly SceneObject[];
    test: (object: UnknownObject) => boolean;
    invert?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: React.FC<PropertiesControlProps<any>>;
    className?: string;
}

const ControlCondition: React.FC<ControlConditionProps> = ({ objects, test, invert, control, className }) => {
    const result = objects.every(test);
    const isValid = invert ? !result : result;

    const Control = control;
    return isValid ? <Control objects={objects} className={className} /> : null;
};

const NoObjectsMessage: React.FC = () => {
    const { t } = useTranslation();
    return <p>{t('panel.noSelection')}</p>;
};

const Controls: React.FC = () => {
    const classes = useControlStyles();
    const [selection] = useSelection();
    const step = useCurrentStep();

    if (selection.size === 0) {
        return <NoObjectsMessage />;
    }

    const objects = getSelectedObjects(step, selection);

    if (objects.length === 0) {
        return <NoObjectsMessage />;
    }

    return (
        <>
            <ControlCondition objects={objects} test={isNamed} control={NameControl} />
            <ControlCondition objects={objects} test={isImageObject} control={ImageControl} />

            <ControlCondition objects={objects} test={isWaymarkGroup} control={WaymarkGroupControl} />

            {/* Style */}
            <ControlCondition objects={objects} test={isTether} control={TetherTypeControl} />
            <div className={mergeClasses(classes.row, classes.alignTop)}>
                <ControlCondition objects={objects} test={isColored} control={ColorControl} className={classes.grow} />
                <ControlCondition objects={objects} test={isArrow} control={ArrowPointersControl} />
                <ControlCondition objects={objects} test={supportsHollow} control={HollowControl} />
            </div>
            <ControlCondition
                objects={objects}
                test={(x) => isWaymark(x) || isWaymarkGroup(x)}
                control={WaymarkOpacityControl}
            />
            <ControlCondition objects={objects} test={isColored} control={ColorSwatchControl} />
            <ControlCondition objects={objects} test={isText} control={TextOutlineControl} />

            {/* 原生（仿游戏原生风格）效果：显示三组颜色与不透明度控制 */}
            <AoeEffectControls objects={objects} />

            {/* 原生（仿游戏原生风格）效果：整体不透明度 + 隐藏按钮 */}
            <div className={mergeClasses(classes.row)}>
                <OpacityControl objects={objects} className={classes.grow} />
                <HideControl objects={objects} />
            </div>

            <ControlCondition objects={objects} test={isDrawObject} control={DrawObjectBrushControl} />
            <ControlCondition objects={objects} test={isText} control={TextLayoutControl} />

            {/* Position/Size */}
            <ControlCondition objects={objects} test={isMovable} control={PositionControl} />
            <ControlCondition objects={objects} test={isResizable} control={SizeControl} />
            <ControlCondition objects={objects} test={isRegularResizable} control={RegularSizeControl} />
            <ControlCondition objects={objects} test={isLineLike} control={LineSizeControl} />
            <ControlCondition objects={objects} test={isExtendable} control={ExtendableControl} />

            {/* TODO: change this to a two-column grid? */}
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isRadiusObject} control={RadiusControl} />
                <ControlCondition objects={objects} test={isInnerRadiusObject} control={InnerRadiusControl} />
                <ControlCondition
                    objects={objects}
                    test={(x) => isExaflareZone(x) || isMechCircleExaflare(x)}
                    control={ExaflareLengthControl}
                />
                <ControlCondition objects={objects} test={isStarburstLike} control={StarburstSpokeWidthControl} />
            </div>

            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isRotatable} control={RotationControl} />
                <ControlCondition objects={objects} test={isTarget} control={TargetRingControl} />
                <ControlCondition
                    objects={objects}
                    test={(x) => isExaflareZone(x) || isMechCircleExaflare(x)}
                    control={ExaflareSpacingControl}
                />
                <ControlCondition objects={objects} test={isStarburstLike} control={StarburstSpokeCountControl} />

                <ControlCondition objects={objects} test={(x) => isFanLike(x)} control={FanAngleControl} />
            </div>

            {/* Special options */}
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isPolygonLike} control={PolygonSidesControl} />
                <ControlCondition objects={objects} test={isPolygonLike} control={PolygonOrientationControl} />
            </div>
            <ControlCondition objects={objects} test={isParty} control={PartyIconControl} />
            <ControlCondition objects={objects} test={isTether} control={TetherWidthControl} />
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={supportsStackCount} control={StackCountControl} />
            </div>
            <ControlCondition objects={objects} test={(x) => isMechGaze(x) || isGaze(x)} control={GazeInvertControl} />
            <ControlCondition objects={objects} test={isIndicatorStack} control={StackMultiHitControl} />
            <ControlCondition objects={objects} test={isText} control={TextValueControl} />
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isIcon} control={IconStacksControl} />
                <ControlCondition objects={objects} test={isIcon} control={IconTimeControl} />
            </div>
            <div className={mergeClasses(classes.row)}>
                <ControlCondition
                    objects={objects}
                    test={(x) => isWaymark(x) || isWaymarkGroup(x)}
                    control={WaymarkRotationControl}
                />
            </div>
            <ControlCondition objects={objects} test={(x) => isBoardIcon(x) || isAsset(x)} control={FlipControl} />
            <LayerControl objects={objects} />
        </>
    );
};
