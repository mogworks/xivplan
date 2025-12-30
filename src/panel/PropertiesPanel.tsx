import { mergeClasses } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentStep } from '../SceneProvider';
import {
    SceneObject,
    UnknownObject,
    isArrow,
    isColored,
    isConeLike,
    isDrawObject,
    isEnemy,
    isExaflareZone,
    isEye,
    isIcon,
    isImageObject,
    isInnerRadiusObject,
    isLineLike,
    isMechEye,
    isMoveable,
    isNamed,
    isParty,
    isPolygonZone,
    isRadiusObject,
    isResizable,
    isRotateable,
    isStarburstZone,
    isTether,
    isText,
    isWaymark,
    supportsHollow,
    supportsStackCount,
} from '../scene';
import { getSelectedObjects, useSelection } from '../selection';
import { useControlStyles } from '../useControlStyles';
import { PropertiesControlProps } from './PropertiesControl';
import { AoeEffectControls } from './properties/AoeEffectControls';
import { ArrowPointersControl } from './properties/ArrowControls';
import { DrawObjectBrushControl } from './properties/BrushControl';
import { ColorControl, ColorSwatchControl } from './properties/ColorControl';
import { ConeAngleControl } from './properties/ConeControls';
import { EnemyRingControl } from './properties/EnemyControls';
import { ExaflareLengthControl, ExaflareSpacingControl } from './properties/ExaflareControls';
import { EyeInvertControl } from './properties/EyeControls';
import { HideControl } from './properties/HideControl';
import { HollowControl } from './properties/HollowControl';
import { IconStacksControl, IconTimeControl } from './properties/IconControls';
import { ImageControl } from './properties/ImageControl';
import { LineSizeControl } from './properties/LineControls';
import { NameControl } from './properties/NameControl';
import { OpacityControl } from './properties/OpacityControl';
import { PartyIconControl } from './properties/PartyControls';
import { PolygonOrientationControl, PolygonSidesControl } from './properties/PolygonControls';
import { PositionControl } from './properties/PositionControl';
import { InnerRadiusControl, RadiusControl } from './properties/RadiusControl';
import { RotationControl } from './properties/RotationControl';
import { SizeControl } from './properties/SizeControl';
import { StackCountControl } from './properties/StackCountControl';
import { StarburstSpokeCountControl, StarburstSpokeWidthControl } from './properties/StarburstControls';
import { TetherTypeControl, TetherWidthControl } from './properties/TetherControls';
import { TextLayoutControl, TextOutlineControl, TextValueControl } from './properties/TextControls';
import { WaymarkOpacityControl, WaymarkRotationControl } from './properties/WaymarkControls';

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

            {/* Style */}
            <ControlCondition objects={objects} test={isTether} control={TetherTypeControl} />
            <div className={mergeClasses(classes.row, classes.alignTop)}>
                <ControlCondition objects={objects} test={isColored} control={ColorControl} className={classes.grow} />
                <ControlCondition objects={objects} test={isArrow} control={ArrowPointersControl} />
                <ControlCondition objects={objects} test={supportsHollow} control={HollowControl} />
            </div>
            <ControlCondition objects={objects} test={isWaymark} control={WaymarkOpacityControl} />
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
            <ControlCondition objects={objects} test={isMoveable} control={PositionControl} />
            <ControlCondition objects={objects} test={isResizable} control={SizeControl} />
            <ControlCondition objects={objects} test={isLineLike} control={LineSizeControl} />

            {/* TODO: change this to a two-column grid? */}
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isRadiusObject} control={RadiusControl} />
                <ControlCondition objects={objects} test={isInnerRadiusObject} control={InnerRadiusControl} />
                <ControlCondition objects={objects} test={isExaflareZone} control={ExaflareLengthControl} />
                <ControlCondition objects={objects} test={isStarburstZone} control={StarburstSpokeWidthControl} />
            </div>

            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isRotateable} control={RotationControl} />
                <ControlCondition objects={objects} test={isEnemy} control={EnemyRingControl} />
                <ControlCondition objects={objects} test={isExaflareZone} control={ExaflareSpacingControl} />
                <ControlCondition objects={objects} test={isStarburstZone} control={StarburstSpokeCountControl} />

                <ControlCondition objects={objects} test={(x) => isConeLike(x)} control={ConeAngleControl} />
            </div>

            {/* Special options */}
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isPolygonZone} control={PolygonSidesControl} />
                <ControlCondition objects={objects} test={isPolygonZone} control={PolygonOrientationControl} />
            </div>
            <ControlCondition objects={objects} test={isParty} control={PartyIconControl} />
            <ControlCondition objects={objects} test={isTether} control={TetherWidthControl} />
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={supportsStackCount} control={StackCountControl} />
            </div>
            <ControlCondition objects={objects} test={(x) => isMechEye(x) || isEye(x)} control={EyeInvertControl} />
            <ControlCondition objects={objects} test={isText} control={TextValueControl} />
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isIcon} control={IconStacksControl} />
                <ControlCondition objects={objects} test={isIcon} control={IconTimeControl} />
            </div>
            <ControlCondition objects={objects} test={isWaymark} control={WaymarkRotationControl} />
        </>
    );
};
