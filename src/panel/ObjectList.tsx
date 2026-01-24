import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Divider, makeStyles, mergeClasses, shorthands, tokens } from '@fluentui/react-components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDefaultLayer, getLayerName } from '../render/ObjectRegistry';
import { SceneObject } from '../scene';
import { addSelection, selectNone, selectSingle, toggleSelection, useSelection, useSpotlight } from '../selection';
import { reversed } from '../util';
import { getListComponent } from './ListComponentRegistry';

export type MoveCallback = (from: number, to: number) => void;

export type LayerChangeCallback = (id: number, newLayer: string) => void;

export interface ObjectListProps {
    objects: readonly SceneObject[];
    onMove: MoveCallback;
    onLayerChange?: LayerChangeCallback;
}

function getObjectIndex(objects: readonly SceneObject[], id: number) {
    return objects.findIndex((o) => o.id === id);
}

const layerOrder: readonly string[] = ['control', 'active', 'fg', 'default', 'ground'];

function groupObjectsByLayer(objects: readonly SceneObject[]) {
    const groups: Record<string, SceneObject[]> = {};
    for (const layer of layerOrder) {
        groups[layer] = [];
    }
    for (const obj of objects) {
        const layer = getLayerName(obj) ?? 'default';
        if (!groups[layer]) {
            groups[layer] = [];
        }
        groups[layer].push(obj);
    }
    return groups;
}

export const ObjectList: React.FC<ObjectListProps> = ({ objects, onMove, onLayerChange }) => {
    const { t } = useTranslation();

    const classes = useStyles();

    const reversedObjects = [...reversed(objects)];

    const objectGroups = groupObjectsByLayer(reversedObjects);

    const [activeId, setActiveId] = useState<number | null>(null);
    const activeObject = activeId ? objects.find((o) => o.id === activeId) : null;

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragStart = (ev: DragStartEvent) => {
        setActiveId(ev.active.id as number);
    };

    const handleDragEnd = (ev: DragEndEvent) => {
        setActiveId(null);

        const { active, over } = ev;

        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id as number;

        if (activeId === overId) return;

        const activeObj = objects.find((o) => o.id === activeId);
        const overObj = objects.find((o) => o.id === overId);

        if (!activeObj || !overObj) return;

        const activeLayer = getLayerName(activeObj) ?? 'default';
        const overLayer = getLayerName(overObj) ?? 'default';

        if (activeLayer !== overLayer && onLayerChange) {
            const defaultLayer = getDefaultLayer(activeObj.type);
            const newLayer = overLayer === defaultLayer ? undefined : overLayer;
            onLayerChange(activeId, newLayer ?? '');
        } else {
            onMove(getObjectIndex(objects, activeId), getObjectIndex(objects, overId));
        }
    };

    const renderLayerSection = (layer: string) => {
        const layerObjects = objectGroups[layer];
        if (!layerObjects || layerObjects.length === 0) return null;

        return (
            <React.Fragment key={layer}>
                <Divider alignContent="center" className={classes.layerDivider}>
                    <span className={classes.layerLabel}>{t(`layer.prefix`) + t(`layer.${layer}`)}</span>
                </Divider>
                <SortableContext items={layerObjects} strategy={verticalListSortingStrategy}>
                    {layerObjects.map((object) => (
                        <SortableItem key={object.id} object={object} />
                    ))}
                </SortableContext>
            </React.Fragment>
        );
    };

    return (
        <div className={classes.list}>
            <DndContext
                sensors={sensors}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {layerOrder.map(renderLayerSection)}
                <DragOverlay>{activeObject && <SortableItemContent object={activeObject} isDragging />}</DragOverlay>
            </DndContext>
        </div>
    );
};

interface SortableItemProps {
    object: SceneObject;
}

interface SortableItemContentProps {
    object: SceneObject;
    isDragging?: boolean;
}

const SortableItemContent: React.FC<SortableItemContentProps> = ({ object, isDragging }) => {
    const classes = useStyles();
    const [selection] = useSelection();
    const isSelected = selection.has(object.id);

    const Component = getListComponent(object);

    return (
        <div
            className={mergeClasses(
                classes.item,
                isSelected && classes.selected,
                isDragging && classes.dragging,
                isDragging && isSelected && classes.draggingSelected,
            )}
        >
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Component object={object} isDragging={isDragging} isSelected={isSelected} />
        </div>
    );
};

const SortableItem: React.FC<SortableItemProps> = ({ object }) => {
    const classes = useStyles();
    const [selection, setSelection] = useSelection();
    const [, setSpotlight] = useSpotlight();

    const onClick = (e: React.MouseEvent) => {
        if (e.shiftKey) {
            setSelection(addSelection(selection, object.id));
        } else if (e.ctrlKey) {
            setSelection(toggleSelection(selection, object.id));
        } else {
            setSelection(selectSingle(object.id));
        }
    };

    const onMouseEnter = () => {
        setSpotlight(selectSingle(object.id));
    };
    const onMouseLeave = () => {
        setSpotlight(selectNone());
    };

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: object.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={mergeClasses(isDragging && classes.draggingWrapper)}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            {...attributes}
            {...listeners}
        >
            <SortableItemContent object={object} isDragging={isDragging} />
        </div>
    );
};

const useStyles = makeStyles({
    list: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalXXS,

        padding: 0,
        ...shorthands.margin(0, `-${tokens.spacingHorizontalXXS}`, tokens.spacingVerticalXL),
        listStyle: 'none',
    },

    draggingWrapper: {
        visibility: 'hidden',
    },

    item: {
        display: 'block',
        zIndex: 0,

        minHeight: '32px',
        borderRadius: tokens.borderRadiusMedium,

        transitionProperty: 'background, border, color',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,

        backgroundColor: tokens.colorNeutralBackground3,

        ':hover': {
            backgroundColor: tokens.colorNeutralBackground3Hover,
        },
        ':hover:active': {
            backgroundColor: tokens.colorNeutralBackground3Pressed,
        },
    },

    selected: {
        color: tokens.colorNeutralForegroundOnBrand,
        backgroundColor: tokens.colorBrandBackgroundSelected,

        ':hover': {
            backgroundColor: tokens.colorBrandBackgroundHover,
        },
        ':hover:active': {
            backgroundColor: tokens.colorBrandBackgroundPressed,
        },
    },

    dragging: {
        backgroundColor: tokens.colorNeutralBackground3Pressed,
    },

    draggingSelected: {
        backgroundColor: tokens.colorBrandBackgroundPressed,
    },

    layerDivider: {
        marginTop: tokens.spacingVerticalXS,
        marginBottom: tokens.spacingVerticalXS,
    },

    layerLabel: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        paddingLeft: tokens.spacingHorizontalXS,
    },
});
