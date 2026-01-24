import { mergeClasses } from '@fluentui/react-components';
import React from 'react';
import { SceneObject } from '../scene';
import { useScene } from '../SceneProvider';
import { useControlStyles } from '../useControlStyles';
import { ObjectList } from './ObjectList';

export interface SceneObjectsPanelProps {
    className?: string;
}

export const SceneObjectsPanel: React.FC<SceneObjectsPanelProps> = ({ className }) => {
    const classes = useControlStyles();
    const { dispatch, step } = useScene();

    const moveObject = (from: number, to: number) => {
        dispatch({ type: 'move', from, to });
    };

    const changeObjectLayer = (id: number, newLayer: string) => {
        const object = step.objects.find((o) => o.id === id);
        if (object) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { layer, ...rest } = object;
            dispatch({
                type: 'update',
                value: newLayer ? { ...rest, layer: newLayer as SceneObject['layer'] } : rest,
            });
        }
    };

    return (
        <div className={mergeClasses(classes.panel, classes.noSelect, className)}>
            <ObjectList objects={step.objects} onMove={moveObject} onLayerChange={changeObjectLayer} />
        </div>
    );
};
