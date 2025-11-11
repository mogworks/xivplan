import React from 'react';
import { shouldUseNativeStyleControls } from '../../lib/aoe/nativeStyleSupport';
import { ColoredObject, SceneObject, isColored } from '../../scene';
import { PropertiesControlProps } from '../PropertiesControl';
import { ColorControl, ColorSwatchControl } from './ColorControl';

export const ClassicColorControl: React.FC<PropertiesControlProps<SceneObject>> = ({ objects, className }) => {
    if (shouldUseNativeStyleControls(objects)) return null;
    if (!objects.every(isColored)) return null;
    return <ColorControl objects={objects as readonly (ColoredObject & SceneObject)[]} className={className} />;
};

export const ClassicColorSwatchControl: React.FC<PropertiesControlProps<SceneObject>> = ({ objects, className }) => {
    if (shouldUseNativeStyleControls(objects)) return null;
    if (!objects.every(isColored)) return null;
    return <ColorSwatchControl objects={objects as readonly (ColoredObject & SceneObject)[]} className={className} />;
};
