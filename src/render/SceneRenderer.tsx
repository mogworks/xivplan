import { makeStyles, tokens } from '@fluentui/react-components';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { PropsWithChildren, RefAttributes, useContext, useEffect, useRef, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import { DefaultCursorProvider } from '../DefaultCursorProvider';
import { getDropAction } from '../DropHandler';
import { SceneHotkeyHandler } from '../HotkeyHandler';
import { EditorState, SceneAction, SceneContext, useScene } from '../SceneProvider';
import { SelectionContext, SelectionState, SpotlightContext } from '../SelectionContext';
import { useCollaboration } from '../collab/CollaborationProvider';
import { RemoteCursorsLayer } from '../collab/RemoteCursorsLayer';
import { RemoteSelectionLayer } from '../collab/RemoteSelectionLayer';
import { SelectionAwarenessSync } from '../collab/SelectionAwarenessSync';
import { getCanvasSize, getSceneCoord } from '../coord';
import { Scene, SceneStep } from '../scene';
import { selectNewObjects, selectNone, useSelection } from '../selection';
import { MIN_STAGE_WIDTH } from '../theme';
import { UndoContext } from '../undo/undoContext';
import { usePanelDrag } from '../usePanelDrag';
import { ArenaRenderer } from './ArenaRenderer';
import { DrawTarget } from './DrawTarget';
import { ObjectRenderer } from './ObjectRenderer';
import { StageContext } from './StageContext';
import { TetherEditRenderer } from './TetherEditRenderer';
import { LayerName } from './layers';

const useStyles = makeStyles({
    stage: {
        gridArea: 'content',
        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'center',
        overflow: 'auto',
        minWidth: MIN_STAGE_WIDTH,
        backgroundColor: tokens.colorNeutralBackground1,
    },
});

export const SceneRenderer: React.FC = () => {
    const classes = useStyles();
    const { scene, stepIndex } = useScene();
    const [, setSelection] = useContext(SelectionContext);
    const collab = useCollaboration();
    const size = React.useMemo(() => getCanvasSize(scene), [scene]);
    const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set([0])); // Start with only step 0 visible
    const [stages, setStages] = useState<Map<number, Konva.Stage>>(new Map());
    const rafRef = useRef<number | null>(null);
    const pendingCursorRef = useRef<{ x: number; y: number } | null>(null);

    // Update visible steps when current step changes
    React.useEffect(() => {
        // Mark this step as visible (loaded)
        setVisibleSteps((prev) => {
            if (!prev.has(stepIndex)) {
                return new Set(prev).add(stepIndex);
            }
            return prev;
        });
    }, [stepIndex]);

    const onClickStage = React.useCallback(
        (e: KonvaEventObject<MouseEvent>, stageIndex: number) => {
            // Only handle clicks on the currently visible stage
            if (stageIndex !== stepIndex) return;

            // Clicking on nothing (with no modifier keys held) should cancel selection.
            if (!e.evt.ctrlKey && !e.evt.shiftKey) {
                setSelection(selectNone());
            }
        },
        [stepIndex, setSelection],
    );

    const onMouseMoveStage = React.useCallback(
        (e: KonvaEventObject<MouseEvent>) => {
            if (!collab.enabled) {
                return;
            }
            const stageNode = e.target.getStage();
            if (!stageNode) {
                return;
            }
            const pointer = stageNode.getPointerPosition();
            if (!pointer) {
                return;
            }
            const coord = getSceneCoord(scene, pointer);
            pendingCursorRef.current = coord;
            if (rafRef.current !== null) {
                return;
            }
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                const next = pendingCursorRef.current;
                if (!next) {
                    return;
                }
                collab.setLocalCursor(next);
            });
        },
        [collab, scene],
    );

    const onMouseLeaveStage = React.useCallback(() => {
        if (collab.enabled) {
            collab.setLocalCursor(undefined);
        }
    }, [collab]);

    // During Konva drag operations, mousemove events don't bubble to Stage.
    // Use onDragMove to track cursor position while dragging objects.
    const onDragMoveStage = React.useCallback(
        (e: KonvaEventObject<DragEvent>) => {
            if (!collab.enabled) {
                return;
            }
            const stageNode = e.target.getStage();
            if (!stageNode) {
                return;
            }
            const pointer = stageNode.getPointerPosition();
            if (!pointer) {
                return;
            }
            const coord = getSceneCoord(scene, pointer);
            pendingCursorRef.current = coord;
            if (rafRef.current !== null) {
                return;
            }
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                const next = pendingCursorRef.current;
                if (!next) {
                    return;
                }
                collab.setLocalCursor(next);
            });
        },
        [collab, scene],
    );

    useEffect(() => {
        if (!collab.enabled) {
            collab.setLocalCursor(undefined);
        }
    }, [collab]);

    const handleStageRef = React.useCallback((stage: Konva.Stage | null, index: number) => {
        if (stage) {
            setStages((prev) => {
                // Only update if the stage has changed
                if (prev.get(index) !== stage) {
                    return new Map(prev).set(index, stage);
                }
                return prev;
            });
        } else {
            setStages((prev) => {
                // Only update if the stage existed before
                if (prev.has(index)) {
                    const newMap = new Map(prev);
                    newMap.delete(index);
                    return newMap;
                }
                return prev;
            });
        }
    }, []);

    return (
        <div className={classes.stage} style={{ maxWidth: size.width }}>
            <DropTarget stage={stages.get(stepIndex) || null}>
                <div style={{ position: 'relative', width: size.width, height: size.height }}>
                    {scene.steps.map((step, index) => {
                        const isVisible = index === stepIndex;
                        const isLoaded = visibleSteps.has(index);

                        // Only render stages that are either currently visible or have been loaded before
                        if (!isVisible && !isLoaded) return null;

                        return (
                            <div
                                key={index}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    opacity: isVisible ? 1 : 0,
                                    pointerEvents: isVisible ? 'auto' : 'none',
                                    zIndex: isVisible ? 1 : 0,
                                }}
                            >
                                <Stage
                                    {...size}
                                    ref={(stage) => handleStageRef(stage, index)}
                                    onClick={(e) => onClickStage(e, index)}
                                    onMouseMove={onMouseMoveStage}
                                    onMouseLeave={onMouseLeaveStage}
                                    onDragMove={onDragMoveStage}
                                >
                                    <StageContext value={stages.get(index) || null}>
                                        <DefaultCursorProvider>
                                            <SceneContents step={step} isVisible={isVisible} />
                                        </DefaultCursorProvider>
                                    </StageContext>
                                </Stage>
                            </div>
                        );
                    })}
                </div>
            </DropTarget>
        </div>
    );
};

export interface ScenePreviewProps extends RefAttributes<Konva.Stage> {
    scene: Scene;
    stepIndex?: number;
    width?: number;
    height?: number;
    /** Do not draw complex objects that may slow down rendering. Useful for small previews. */
    simple?: boolean;
    /** Show the arena background */
    showArena?: boolean;
}

export const ScenePreview: React.FC<ScenePreviewProps> = ({
    ref,
    scene,
    stepIndex,
    width,
    height,
    simple,
    showArena = true,
}) => {
    const size = getCanvasSize(scene);
    let scale = 1;
    let x = 0;
    let y = 0;

    if (width) {
        scale = Math.min(scale, width / size.width);
    }
    if (height) {
        scale = Math.min(scale, height / size.height);
    }

    size.width *= scale;
    size.height *= scale;

    if (width) {
        x = (width - size.width) / 2;
    }
    if (height) {
        y = (height - size.height) / 2;
    }

    const present: EditorState = {
        scene,
        currentStep: stepIndex ?? 0,
    };

    const sceneContext: UndoContext<EditorState, SceneAction> = [
        {
            present,
            transientPresent: present,
            past: [],
            future: [],
        },
        () => undefined,
    ];

    const selectionContext: SelectionState = [new Set<number>(), () => {}];
    const spotlightContext: SelectionState = [new Set<number>(), () => {}];

    return (
        <Stage ref={ref} x={x} y={y} width={width} height={height} scaleX={scale} scaleY={scale}>
            <DefaultCursorProvider>
                <SceneContext value={sceneContext}>
                    <SelectionContext value={selectionContext}>
                        <SpotlightContext value={spotlightContext}>
                            <SceneContents
                                listening={false}
                                simple={simple}
                                step={present.scene.steps[present.currentStep] || { objects: [] }}
                                showArena={showArena}
                            />
                        </SpotlightContext>
                    </SelectionContext>
                </SceneContext>
            </DefaultCursorProvider>
        </Stage>
    );
};

interface SceneContentsProps {
    listening?: boolean;
    simple?: boolean;
    step: SceneStep;
    showArena?: boolean;
}

const SceneContents: React.FC<SceneContentsProps & { isVisible?: boolean }> = React.memo(
    ({ listening, simple, step, isVisible, showArena = true }) => {
        listening = listening ?? true;

        return (
            <>
                {listening && isVisible && <SceneHotkeyHandler />}
                {listening && isVisible && <SelectionAwarenessSync />}

                <Layer name={LayerName.Ground} listening={listening}>
                    {showArena && <ArenaRenderer simple={simple} />}
                    <ObjectRenderer objects={step.objects} layer={LayerName.Ground} />
                </Layer>
                <Layer name={LayerName.Default} listening={listening}>
                    <ObjectRenderer objects={step.objects} layer={LayerName.Default} />
                </Layer>
                <Layer name={LayerName.Foreground} listening={listening}>
                    <ObjectRenderer objects={step.objects} layer={LayerName.Foreground} />

                    <TetherEditRenderer />
                </Layer>
                <Layer name={LayerName.Active} listening={listening}>
                    <DrawTarget />
                </Layer>
                <Layer name={LayerName.Controls} listening={listening} />

                {listening && isVisible && <RemoteCursorsLayer />}
                {listening && isVisible && <RemoteSelectionLayer />}
            </>
        );
    },
);
SceneContents.displayName = 'SceneContents';

interface DropTargetProps extends PropsWithChildren {
    stage: Konva.Stage | null;
}

const DropTarget: React.FC<DropTargetProps> = ({ stage, children }) => {
    const { scene, dispatch } = useScene();
    const [, setSelection] = useSelection();
    const [dragObject, setDragObject] = usePanelDrag();

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();

        if (!dragObject || !stage) {
            return;
        }

        setDragObject(null);
        stage.setPointersPositions(e);

        const position = stage.getPointerPosition();
        if (!position) {
            return;
        }

        position.x -= dragObject.offset.x;
        position.y -= dragObject.offset.y;

        const action = getDropAction(dragObject, getSceneCoord(scene, position));
        if (action) {
            dispatch(action);
            setSelection(selectNewObjects(scene, 1));
        }
    };

    return (
        <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} style={{ width: '100%', height: '100%' }}>
            {children}
        </div>
    );
};
