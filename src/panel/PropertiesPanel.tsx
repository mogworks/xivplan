import { mergeClasses } from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentStep } from '../SceneProvider';
import { shouldUseNativeStyleControls } from '../lib/aoe/nativeStyleSupport';
import {
    SceneObject,
    UnknownObject,
    isArcZone,
    isArrow,
    isConeZone,
    isDrawObject,
    isEnemy,
    isExaflareZone,
    isEye,
    isIcon,
    isImageObject,
    isInnerRadiusObject,
    isLineZone,
    isMarker,
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
    supportsHollow,
    supportsNativeStyle,
    supportsStackCount,
} from '../scene';
import { getSelectedObjects, useSelection } from '../selection';
import { useControlStyles } from '../useControlStyles';
import { PropertiesControlProps } from './PropertiesControl';
import { AoeEffectControls } from './properties/AoeEffectControls';
import { AoeGlobalOpacityControl } from './properties/AoeGlobalOpacityControl';
import { ArrowPointersControl } from './properties/ArrowControls';
import { DrawObjectBrushControl } from './properties/BrushControl';
import { ConeAngleControl } from './properties/ConeControls';
import { EnemyRingControl } from './properties/EnemyControls';
import { ExaflareLengthControl, ExaflareSpacingControl } from './properties/ExaflareControls';
import { EyeInvertControl } from './properties/EyeControls';
import { HideControl } from './properties/HideControl';
import { HollowControl } from './properties/HollowControl';
import { IconStacksControl, IconTimeControl } from './properties/IconControls';
import { ImageControl } from './properties/ImageControl';
import { LineSizeControl } from './properties/LineControls';
import { MarkerShapeControl } from './properties/MarkerControls';
import { NameControl } from './properties/NameControl';
import { OpacityControl } from './properties/OpacityControl';
import { PartyIconControl } from './properties/PartyControls';
import { PolygonOrientationControl, PolygonSidesControl } from './properties/PolygonControls';
import { PositionControl } from './properties/PositionControl';
import { InnerRadiusControl, RadiusControl } from './properties/RadiusControl';
import { RotationControl } from './properties/RotationControl';
import { SimpleColorControl, SimpleColorSwatchControl } from './properties/SimpleColorControls';
import { SizeControl } from './properties/SizeControl';
import { StackCountControl } from './properties/StackCountControl';
import { StarburstSpokeCountControl, StarburstSpokeWidthControl } from './properties/StarburstControls';
import { TetherTypeControl, TetherWidthControl } from './properties/TetherControls';
import { TextLayoutControl, TextOutlineControl, TextValueControl } from './properties/TextControls';
import { ZoneStyleTypeControl } from './properties/ZoneStyleTypeControl';

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

            <ControlCondition objects={objects} test={supportsNativeStyle} control={ZoneStyleTypeControl} />

            {/* Style */}
            <ControlCondition objects={objects} test={isTether} control={TetherTypeControl} />
            <div className={mergeClasses(classes.row, classes.alignTop)}>
                <SimpleColorControl objects={objects} className={classes.grow} />
                <ControlCondition objects={objects} test={isArrow} control={ArrowPointersControl} />
                <ControlCondition
                    objects={objects}
                    test={(obj) => supportsHollow(obj) && !supportsNativeStyle(obj)}
                    control={HollowControl}
                />
                <ControlCondition objects={objects} test={isMarker} control={MarkerShapeControl} />
            </div>
            <SimpleColorSwatchControl objects={objects} />
            <ControlCondition objects={objects} test={isText} control={TextOutlineControl} />

            {/* 原生（仿游戏原生风格）效果：显示三组颜色与不透明度控制 */}
            <AoeEffectControls objects={objects} />

            {/* 原生（仿游戏原生风格）效果：整体不透明度 + 隐藏按钮 */}
            <div className={mergeClasses(classes.row)}>
                {shouldUseNativeStyleControls(objects) ? (
                    <AoeGlobalOpacityControl objects={objects} className={classes.grow} />
                ) : (
                    <OpacityControl objects={objects} className={classes.grow} />
                )}
                <HideControl objects={objects} />
            </div>

            <ControlCondition objects={objects} test={isDrawObject} control={DrawObjectBrushControl} />
            <ControlCondition objects={objects} test={isText} control={TextLayoutControl} />

            {/* Position/Size */}
            <ControlCondition objects={objects} test={isMoveable} control={PositionControl} />
            <ControlCondition objects={objects} test={isResizable} control={SizeControl} />
            <ControlCondition objects={objects} test={isLineZone} control={LineSizeControl} />

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

                <ControlCondition
                    objects={objects}
                    test={(x) => isArcZone(x) || isConeZone(x)}
                    control={ConeAngleControl}
                />
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
            <ControlCondition objects={objects} test={isEye} control={EyeInvertControl} />
            <ControlCondition objects={objects} test={isText} control={TextValueControl} />
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isIcon} control={IconStacksControl} />
                <ControlCondition objects={objects} test={isIcon} control={IconTimeControl} />
            </div>
        </>
    );
};
