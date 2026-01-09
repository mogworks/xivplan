import { Layer, Psd, writePsd } from 'ag-psd';
import { getCanvasSize } from '../coord';
import { LayerName } from '../render/layers';
import { getLayerName } from '../render/ObjectRegistry';
import { Scene, SceneObject, SceneStep } from '../scene';
import type { EditorState } from '../SceneProvider';
import type { SelectionState } from '../SelectionContext';
import type { UndoContext } from '../undo/undoContext';

export async function saveSceneAsPSD(scene: Readonly<Scene>): Promise<Blob> {
    const size = getCanvasSize(scene);

    console.log('size', size);
    console.log('scene', scene);

    // 创建图层数组，每个元素一个图层
    const children: Layer[] = [];

    // 为每个 step 的每个对象创建图层
    for (let stepIndex = 0; stepIndex < scene.steps.length; stepIndex++) {
        const step = scene.steps[stepIndex];
        if (!step) continue;

        for (let objectIndex = 0; objectIndex < step.objects.length; objectIndex++) {
            const object = step.objects[objectIndex];
            if (!object) continue;

            const objectCanvas = await renderObjectToCanvas(size, scene, stepIndex, object, objectIndex);

            const layerName = getObjectLayerName(object, stepIndex, objectIndex);

            children.push({
                top: 0,
                left: 0,
                bottom: size.height,
                right: size.width,
                blendMode: 'normal',
                opacity: 255,
                transparencyProtected: false,
                hidden: false,
                clipping: false,
                name: layerName,
                canvas: objectCanvas,
            });
        }
    }

    // 创建 PSD 文档
    const psd: Psd = {
        width: size.width,
        height: size.height,
        channels: 3, // RGB
        bitsPerChannel: 8, // 8-bit
        colorMode: 3, // RGB color mode
        children: children,
    };

    const buffer = writePsd(psd);
    return new Blob([buffer], { type: 'image/vnd.adobe.photoshop' });
}

function getObjectLayerName(object: SceneObject, stepIndex: number, objectIndex: number): string {
    const layerName = getLayerName(object);
    const layerSuffix = layerName ? ` [${layerName}]` : '';
    return `Step ${stepIndex + 1} - Object ${objectIndex + 1}${layerSuffix}`;
}

async function renderObjectToCanvas(
    size: { width: number; height: number },
    scene: Readonly<Scene>,
    stepIndex: number,
    object: SceneObject,
    objectIndex: number,
): Promise<HTMLCanvasElement> {
    // 动态导入 React 和相关组件
    const React = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { Stage } = await import('react-konva');
    const { Layer } = await import('react-konva');
    const { ObjectLoadingProvider } = await import('../ObjectLoadingProvider');
    const { DefaultCursorProvider } = await import('../DefaultCursorProvider');
    const { SceneContext } = await import('../SceneProvider');
    const { SelectionContext, SpotlightContext } = await import('../SelectionContext');
    const { ObjectContext } = await import('../prefabs/ObjectContext');
    const { getRenderer } = await import('../render/ObjectRegistry');

    return new Promise((resolve, reject) => {
        // 创建临时容器
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.visibility = 'hidden';
        container.style.width = `${size.width}px`;
        container.style.height = `${size.height}px`;
        document.body.appendChild(container);

        // 创建 root
        const root = createRoot(container);
        let stageRef: any = null;

        // 创建只包含当前对象的临时 step
        const singleObjectStep: SceneStep = {
            objects: [object],
        };

        // 创建临时的 scene context
        const present: EditorState = {
            scene: {
                ...scene,
                steps: scene.steps.map((step, idx) => (idx === stepIndex ? singleObjectStep : { objects: [] })),
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

        const selectionContext: SelectionState = [new Set<number>(), () => {}];
        const spotlightContext: SelectionState = [new Set<number>(), () => {}];

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
                    DefaultCursorProvider,
                    null,
                    React.createElement(
                        SceneContext.Provider,
                        { value: sceneContext },
                        React.createElement(
                            SelectionContext.Provider,
                            { value: selectionContext },
                            React.createElement(
                                SpotlightContext.Provider,
                                { value: spotlightContext },
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
                    ),
                ),
            ),
        );

        root.render(element);

        // 延迟获取 canvas，确保渲染完成
        const timer = setTimeout(async () => {
            try {
                if (!stageRef) {
                    throw new Error('Failed to get stage reference');
                }

                // 使用 stage 的 toCanvas 方法，不使用裁剪
                const canvas = stageRef.toCanvas({ pixelRatio: 1 });

                // 清理
                root.unmount();
                document.body.removeChild(container);

                resolve(canvas);
            } catch (ex) {
                clearTimeout(timer);
                root.unmount();
                if (container.parentNode) {
                    document.body.removeChild(container);
                }
                reject(ex);
            }
        }, 1000);
    });
}
