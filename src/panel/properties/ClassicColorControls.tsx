import React from 'react';
import { ColoredObject, SceneObject, isColored, supportsRealisticStyle } from '../../scene';
import { PropertiesControlProps } from '../PropertiesControl';
import { ColorControl, ColorSwatchControl } from './ColorControl';

function shouldShowClassicColor(objects: readonly SceneObject[]): boolean {
    // 当所有选中对象都支持写实样式，且至少一个对象为 realistic 变体时，隐藏经典颜色控件
    const allSupportRealistic = objects.length > 0 && objects.every((o) => supportsRealisticStyle(o));
    // 仅在支持写实样式的对象中检查 styleType，避免在 SceneObject 联合类型上访问不存在的属性
    const someRealistic = objects.some((o) => supportsRealisticStyle(o) && o.styleType === 'realistic');
    if (allSupportRealistic && someRealistic) {
        return false;
    }
    return true;
}

export const ClassicColorControl: React.FC<PropertiesControlProps<SceneObject>> = ({ objects, className }) => {
    if (!shouldShowClassicColor(objects)) return null;
    if (!objects.every(isColored)) return null;
    return <ColorControl objects={objects as readonly (ColoredObject & SceneObject)[]} className={className} />;
};

export const ClassicColorSwatchControl: React.FC<PropertiesControlProps<SceneObject>> = ({ objects, className }) => {
    if (!shouldShowClassicColor(objects)) return null;
    if (!objects.every(isColored)) return null;
    return <ColorSwatchControl objects={objects as readonly (ColoredObject & SceneObject)[]} className={className} />;
};
