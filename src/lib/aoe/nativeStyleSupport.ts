import { SceneObject, supportsNativeStyle } from '../../scene';

/**
 * 判断是否所有选中对象都支持原生（native）样式。
 */
function allSupportNativeStyle(objects: readonly SceneObject[]): boolean {
    return objects.length > 0 && objects.every((o) => supportsNativeStyle(o));
}

/**
 * 判断选中对象中是否至少有一个是原生（native）样式。
 * 仅在支持原生样式的对象上检查，避免在联合类型上访问不存在的属性。
 */
function someNativeStyle(objects: readonly SceneObject[]): boolean {
    return objects.some((o) => supportsNativeStyle(o) && o.native);
}

/**
 * 是否显示（或启用）原生样式相关控制：
 * 需要所有对象支持原生样式，且至少有一个为 native 样式。
 */
export function shouldUseNativeStyleControls(objects: readonly SceneObject[]): boolean {
    return allSupportNativeStyle(objects) && someNativeStyle(objects);
}
