import React from 'react';
import { ColoredObject, SceneObject, isColored, supportsNativeStyle } from '../../scene';
import { PropertiesControlProps } from '../PropertiesControl';
import { ColorControl, ColorSwatchControl } from './ColorControl';

function shouldShowClassicColor(objects: readonly SceneObject[]): boolean {
    // 当所有选中对象都支持原生样式，且至少一个对象为 native 变体时，隐藏朴素颜色控件
    const allSupportNative = objects.length > 0 && objects.every((o) => supportsNativeStyle(o));
    // 仅在支持原生样式的对象中检查 styleType，避免在 SceneObject 联合类型上访问不存在的属性
    const someNative = objects.some((o) => supportsNativeStyle(o) && o.styleType === 'native');
    if (allSupportNative && someNative) {
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
