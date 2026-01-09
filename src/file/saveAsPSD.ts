import { Layer as PSDLayer, Psd, writePsd } from 'ag-psd';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Layer, Stage } from 'react-konva';
import { getCanvasSize } from '../coord';
import { ObjectLoadingProvider } from '../ObjectLoadingProvider';
import { ObjectContext } from '../prefabs/ObjectContext';
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

        const stepLayers = await renderStep(step, render);
        children.push({
            name: groupName,
            children: stepLayers,
        });
    }

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

async function renderStep(step: SceneStep, render: ObjectToCanvasRender): Promise<PSDLayer[]> {
    // TODO: 渲染场地背景
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
    for (const layerName in layerNameToLayers) {
        const objects = layerNameToLayers[layerName];
        if (!objects) continue;
        layers.push({
            name: layerName,
            children: (await renderSceneLayer(objects, render)).reverse(),
        });
    }
    return layers;
}

async function renderSceneLayer(scene: SceneObject[], render: ObjectToCanvasRender): Promise<PSDLayer[]> {
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
            name: `Object ${i + 1}`,
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

    private async waitForRenderFrames(times = 2) {
        for (let i = 0; i < times; i++) {
            await new Promise(requestAnimationFrame);
        }
    }

    dispose() {
        this.root.unmount();
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }

    async render(object: SceneObject): Promise<HTMLCanvasElement> {
        const { size, scene, container, root } = this;

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

        // 渲染单个对象
        const element = React.createElement(
            ObjectLoadingProvider,
            null,
            React.createElement(
                Stage,
                {
                    ref: (ref: any) => {
                        stageRef = ref;
                    },
                    width: size.width,
                    height: size.height,
                },
                React.createElement(
                    SceneContext.Provider,
                    { value: sceneContext },
                    React.createElement(
                        Layer,
                        { name: objectLayer, listening: false },
                        React.createElement(
                            ObjectContext.Provider,
                            { value: object },
                            React.createElement(RendererComponent, { object }),
                        ),
                    ),
                ),
            ),
        );

        return new Promise((resolve, reject) => {
            root.render(element);

            // 延迟获取 canvas，确保渲染完成
            const timer = setTimeout(async () => {
                try {
                    if (!stageRef) {
                        throw new Error('Failed to get stage reference');
                    }

                    // 使用 stage 的 toCanvas 方法，不使用裁剪
                    const canvas = stageRef.toCanvas({ pixelRatio: 1 });

                    resolve(canvas);
                } catch (ex) {
                    clearTimeout(timer);
                    reject(ex);
                }
            }, 500);
        });
    }
}
