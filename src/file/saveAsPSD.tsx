import { Layer as PSDLayer, Psd, writePsd } from 'ag-psd';
import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Layer, Stage } from 'react-konva';
import { getCanvasSize } from '../coord';
import { ArenaRenderer } from '../render/ArenaRenderer';
import { DrawTarget } from '../render/DrawTarget';
import { LayerName } from '../render/layers';
import { getLayerName } from '../render/ObjectRegistry';
import { ObjectRenderer } from '../render/ObjectRenderer';
import { TetherEditRenderer } from '../render/TetherEditRenderer';
import { Scene, SceneStep } from '../scene';
import { EditorState, SceneContext } from '../SceneProvider';
import { UndoContext } from '../undo/undoContext';

export async function saveSceneAsPSD(scene: Readonly<Scene>): Promise<Blob> {
    const size = getCanvasSize(scene);

    // 创建图层数组，每个元素一个图层
    const children: PSDLayer[] = [];
    const render = new SceneToCanvasRender(size, scene);

    // 为每个 step 创建图层组
    for (let stepIndex = 0; stepIndex < scene.steps.length; stepIndex++) {
        const step = scene.steps[stepIndex];
        if (!step) continue;

        const groupName = `Step ${stepIndex + 1}`;
        const stepLayers = await renderStep(step, stepIndex, render, `${groupName} - `);

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

    const buffer = writePsd(psd);
    return new Blob([buffer], { type: 'image/vnd.adobe.photoshop' });
}

async function renderStep(
    step: SceneStep,
    stepIndex: number,
    render: SceneToCanvasRender,
    namePrefix: string,
): Promise<PSDLayer[]> {
    const layers: PSDLayer[] = [];

    // 先渲染 Arena 背景（只渲染一次，包含 Arena 但不包含任何对象）
    const arenaCanvas = await render.renderStepWithHide(step, stepIndex, null, true);
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
        name: `${namePrefix}Arena`,
        canvas: arenaCanvas,
    });

    // 按 LayerName 分组对象
    const layerNameToObjects: { [layerName: string]: (typeof step.objects)[number][] } = {};
    for (const object of step.objects) {
        if (!object) continue;
        const layerName = getLayerName(object) ?? LayerName.Default;
        if (!layerNameToObjects[layerName]) {
            layerNameToObjects[layerName] = [];
        }
        layerNameToObjects[layerName].push(object);
    }

    // 按图层顺序创建图层组
    const layerOrder = [
        LayerName.Ground,
        LayerName.Default,
        LayerName.Foreground,
        LayerName.Active,
        LayerName.Controls,
    ];

    for (const layerName of layerOrder) {
        const objects = layerNameToObjects[layerName];
        if (!objects || objects.length === 0) continue;

        // 为该图层创建图层组
        const layerChildren: PSDLayer[] = [];

        // 为每个对象创建图层，通过 hide 属性控制显示（不包含 Arena，Arena 已经单独渲染了）
        for (const object of objects) {
            if (!object) continue;
            const objectCanvas = await render.renderStepWithHide(step, stepIndex, object.id, false);

            layerChildren.push({
                top: 0,
                left: 0,
                bottom: render.size.height,
                right: render.size.width,
                blendMode: 'normal',
                opacity: 255,
                transparencyProtected: false,
                hidden: false,
                clipping: false,
                name: `${object.type} (${object.id})`,
                canvas: objectCanvas,
            });
        }

        // 如果该图层有对象，创建图层组
        if (layerChildren.length > 0) {
            layers.push({
                name: `${namePrefix}${layerName}`,
                children: layerChildren,
            });
        }
    }

    return layers;
}

class SceneToCanvasRender {
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

    /**
     * 渲染 step，通过 hide 属性控制对象的显示
     * @param step 要渲染的 step
     * @param stepIndex step 的索引
     * @param visibleObjectId 要显示的对象 ID，如果为 null 则只显示 Arena，其他对象都隐藏
     * @param includeArena 是否包含 Arena 渲染
     */
    async renderStepWithHide(
        step: SceneStep,
        stepIndex: number,
        visibleObjectId: number | null,
        includeArena: boolean = true,
    ): Promise<HTMLCanvasElement> {
        const { size, scene, root } = this;

        // 创建修改后的 step，设置对象的 hide 属性
        const modifiedObjects = step.objects.map((obj) => {
            if (visibleObjectId === null) {
                // 只显示 Arena，隐藏所有对象
                return { ...obj, hide: true };
            } else {
                // 只显示指定的对象，隐藏其他对象
                return { ...obj, hide: obj.id !== visibleObjectId };
            }
        });

        const modifiedStep: SceneStep = {
            objects: modifiedObjects,
        };

        // 创建包含修改后的 step 的场景
        const modifiedSteps = scene.steps.map((_, idx) => (idx === stepIndex ? modifiedStep : { objects: [] }));

        const present: EditorState = {
            scene: {
                ...scene,
                steps: modifiedSteps,
            },
            currentStep: stepIndex,
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

        return new Promise<HTMLCanvasElement>((resolve, reject) => {
            const SceneElement = () => {
                const stageRef = useRef<any>(null);

                useEffect(() => {
                    const waitForRender = async () => {
                        // 等待 React 渲染完成
                        await new Promise((r) => setTimeout(r, 50));

                        // 使用 requestAnimationFrame 确保 DOM 更新完成
                        requestAnimationFrame(() => {
                            requestAnimationFrame(async () => {
                                try {
                                    const stage = stageRef.current;
                                    if (!stage) {
                                        reject(new Error('Failed to get stage reference'));
                                        return;
                                    }

                                    // 等待 Konva 渲染完成
                                    await new Promise((r) => setTimeout(r, 100));

                                    const canvas = stage.toCanvas({ pixelRatio: 1 });
                                    resolve(canvas);
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        });
                    };

                    waitForRender();
                }, []);

                return (
                    <Stage ref={stageRef} width={size.width} height={size.height}>
                        <SceneContext.Provider value={sceneContext}>
                            <SceneContents step={modifiedStep} listening={false} includeArena={includeArena} />
                        </SceneContext.Provider>
                    </Stage>
                );
            };

            root.render(<SceneElement />);
        });
    }
}

// 复制 SceneContents 组件，用于渲染完整场景
const SceneContents: React.FC<{
    listening?: boolean;
    simple?: boolean;
    step: SceneStep;
    includeArena?: boolean;
}> = ({ listening, simple, step, includeArena = true }) => {
    listening = listening ?? true;

    return (
        <>
            <Layer name={LayerName.Ground} listening={listening}>
                {includeArena && <ArenaRenderer simple={simple} />}
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
        </>
    );
};
