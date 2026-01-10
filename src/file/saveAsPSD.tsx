import { Layer as PSDLayer, Psd, writePsd } from 'ag-psd';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Layer, Stage } from 'react-konva';
import { getCanvasSize } from '../coord';
import { ObjectLoadingProvider } from '../ObjectLoadingProvider';
import { ObjectContext } from '../prefabs/ObjectContext';
import { ArenaRenderer } from '../render/ArenaRenderer';
import { LayerName } from '../render/layers';
import { getLayerName, getRenderer } from '../render/ObjectRegistry';
import { Scene, SceneObject, SceneStep } from '../scene';
import { EditorState, SceneContext } from '../SceneProvider';
import { UndoContext } from '../undo/undoContext';

export async function saveSceneAsPSD(scene: Readonly<Scene>): Promise<Blob> {
    const size = getCanvasSize(scene);

    console.log('size', size);
    console.log('scene', scene);

    // 创建图层数组，每个元素一个图层
    const children: PSDLayer[] = [];
    const render = new ObjectToCanvasRender(size, scene);
    // 为每个 step 的每个对象创建图层
    for (let stepIndex = 0; stepIndex < scene.steps.length; stepIndex++) {
        const step = scene.steps[stepIndex];
        if (!step) continue;

        const groupName = `Step ${stepIndex + 1}`;

        const stepLayers = await renderStep(step, render, `${groupName} - `);
        children.push({
            name: groupName,
            children: stepLayers,
        });
    }

    render.dispose();

    // 创建 PSD 文档
    const psd: Psd = {
        width: size.width,
        height: size.height,
        channels: 3, // RGB
        bitsPerChannel: 8, // 8-bit
        colorMode: 3, // RGB color mode
        children: children.reverse(), // PSD 图层顺序是反的
    };

    console.log('psd', psd);

    const buffer = writePsd(psd);
    return new Blob([buffer], { type: 'image/vnd.adobe.photoshop' });
}

async function renderStep(step: SceneStep, render: ObjectToCanvasRender, namePrefix: string): Promise<PSDLayer[]> {
    const layerNameToLayers: { [layerName: string]: SceneObject[] } = {};
    for (let i = 0; i < step.objects.length; i++) {
        const object = step.objects[i];
        if (!object) continue;
        const layerName = getLayerName(object) ?? LayerName.Default;
        if (!layerNameToLayers[layerName]) {
            layerNameToLayers[layerName] = [object];
        } else {
            layerNameToLayers[layerName].push(object);
        }
    }
    console.log('layerNameToLayers', layerNameToLayers);
    const layers: PSDLayer[] = [];
    // 为每个图层渲染对象
    for (const layerName of [
        LayerName.Ground,
        LayerName.Default,
        LayerName.Foreground,
        LayerName.Active,
        LayerName.Controls,
    ]) {
        const children: PSDLayer[] = [];
        if (layerName === LayerName.Ground) {
            // 渲染场地背景
            const arenaCanvas = await render.renderArena();
            children.push({
                top: 0,
                left: 0,
                bottom: render.size.height,
                right: render.size.width,
                blendMode: 'normal',
                opacity: 255,
                transparencyProtected: false,
                hidden: false,
                clipping: false,
                name: `${namePrefix}${layerName} - Arena`,
                canvas: arenaCanvas,
            });
        }
        const objects = layerNameToLayers[layerName];
        if (!objects) continue;
        children.push(...(await renderSceneLayer(objects, render, `${namePrefix}${layerName} - `)));
        layers.push({
            name: `${namePrefix}${layerName}`,
            children,
        });
    }
    return layers;
}

async function renderSceneLayer(
    scene: SceneObject[],
    render: ObjectToCanvasRender,
    namePrefix: string,
): Promise<PSDLayer[]> {
    const layers: PSDLayer[] = [];
    for (let i = 0; i < scene.length; i++) {
        const object = scene[i];
        if (!object) continue;
        console.log('Rendering object for PSD:', object);
        const objectCanvas = await render.render(object);
        layers.push({
            top: 0,
            left: 0,
            bottom: render.size.height,
            right: render.size.width,
            blendMode: 'normal',
            opacity: 255,
            transparencyProtected: false,
            hidden: false,
            clipping: false,
            name: `${namePrefix} ${object.type} ${scene.length - i}`,
            canvas: objectCanvas,
        });
    }
    return layers;
}

class ObjectToCanvasRender {
    private container: HTMLDivElement;
    private root: ReturnType<typeof createRoot>;

    constructor(
        public size: { width: number; height: number },
        public scene: Readonly<Scene>,
    ) {
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.visibility = 'hidden';
        this.container.style.width = `${size.width}px`;
        this.container.style.height = `${size.height}px`;
        document.body.appendChild(this.container);
        this.root = createRoot(this.container);
    }

    dispose() {
        this.root.unmount();
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }

    async renderArena(): Promise<HTMLCanvasElement> {
        const { size, scene, root } = this;

        let stageRef: any = null;

        const present: EditorState = {
            scene,
            currentStep: 0,
        };

        const sceneContext: UndoContext<EditorState, any> = [
            {
                present,
                transientPresent: present,
                past: [],
                future: [],
            },
            () => undefined,
        ];

        const Element = ({ drawSuccess }: { drawSuccess: (canvas: HTMLCanvasElement) => void }) => {
            stageRef = React.useRef(null);

            useEffect(() => {
                const timer = setInterval(() => {
                    const stage = stageRef?.current;
                    if (!stage) return;

                    try {
                        const canvas = stage.toCanvas({ pixelRatio: 1 });
                        drawSuccess(canvas);

                        clearInterval(timer);
                    } catch (error) {
                        // ignore and retry until a valid stage is ready
                    }
                }, 100);

                return () => {
                    clearInterval(timer);
                };
            }, []);

            return (
                <ObjectLoadingProvider>
                    <Stage ref={stageRef} width={size.width} height={size.height}>
                        <SceneContext.Provider value={sceneContext}>
                            <Layer name={LayerName.Default} listening={false}>
                                <ArenaRenderer />
                            </Layer>
                        </SceneContext.Provider>
                    </Stage>
                </ObjectLoadingProvider>
            );
        };

        return new Promise((resolve) => {
            const drawSuccess = (canvas: HTMLCanvasElement | null) => {
                if (!canvas) return;
                resolve(canvas);
            };
            root.render(<Element drawSuccess={drawSuccess} />);
        });
    }

    async render(object: SceneObject): Promise<HTMLCanvasElement> {
        const { size, scene, root } = this;

        let stageRef: any = null;

        // 创建只包含当前对象的临时 step
        const singleObjectStep: SceneStep = {
            objects: [object],
        };

        // 创建临时的 scene context
        const present: EditorState = {
            scene: {
                ...scene,
                steps: [singleObjectStep],
            },
            currentStep: 0,
        };

        const sceneContext: UndoContext<EditorState, any> = [
            {
                present,
                transientPresent: present,
                past: [],
                future: [],
            },
            () => undefined,
        ];

        // 获取对象的渲染组件
        const RendererComponent = getRenderer(object);
        const objectLayer = getLayerName(object) ?? LayerName.Default;

        const Element = ({ drawSuccess }: { drawSuccess: (canvas: HTMLCanvasElement) => void }) => {
            stageRef = React.useRef(null);

            useEffect(() => {
                const timer = setInterval(() => {
                    const stage = stageRef?.current;
                    if (!stage) return;

                    try {
                        const canvas = stage.toCanvas({ pixelRatio: 1 });
                        drawSuccess(canvas);

                        clearInterval(timer);
                    } catch (error) {
                        // ignore and retry until a valid stage is ready
                    }
                }, 100);

                return () => {
                    clearInterval(timer);
                };
            }, []);

            return (
                <ObjectLoadingProvider>
                    <Stage ref={stageRef} width={size.width} height={size.height}>
                        <SceneContext.Provider value={sceneContext}>
                            <Layer name={objectLayer} listening={false}>
                                <ObjectContext.Provider value={object}>
                                    <RendererComponent object={object}></RendererComponent>
                                </ObjectContext.Provider>
                            </Layer>
                        </SceneContext.Provider>
                    </Stage>
                </ObjectLoadingProvider>
            );
        };

        return new Promise((resolve) => {
            const drawSuccess = (canvas: HTMLCanvasElement | null) => {
                if (!canvas) return;
                resolve(canvas);
            };
            root.render(<Element drawSuccess={drawSuccess} />);
        });
    }
}
