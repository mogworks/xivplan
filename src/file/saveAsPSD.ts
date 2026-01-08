import { Layer, Psd, writePsd } from 'ag-psd';
import { getCanvasSize } from '../coord';
import { Scene } from '../scene';

export async function saveSceneAsPSD(scene: Readonly<Scene>): Promise<Blob> {
    const size = getCanvasSize(scene);

    // 创建图层数组，每个 step 一个图层
    const children: Layer[] = [];

    // 为每个 step 创建一个图层
    for (let stepIndex = 0; stepIndex < scene.steps.length; stepIndex++) {
        const stepCanvas = await renderStepToCanvas(size, scene, stepIndex);

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
            name: `Step ${stepIndex + 1}`,
            canvas: stepCanvas,
        });
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

async function renderStepToCanvas(
    size: { width: number; height: number },
    scene: Readonly<Scene>,
    stepIndex: number,
): Promise<HTMLCanvasElement> {
    // 动态导入 React 和 ScenePreview
    const React = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { ScenePreview } = await import('../render/SceneRenderer');
    const { ObjectLoadingProvider } = await import('../ObjectLoadingProvider');

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

        // 渲染 ScenePreview 包装在 ObjectLoadingProvider 中
        const element = React.createElement(
            ObjectLoadingProvider,
            null,
            React.createElement(ScenePreview, {
                ref: (ref: any) => {
                    stageRef = ref;
                },
                scene: scene,
                stepIndex: stepIndex,
                width: size.width,
                height: size.height,
            }),
        );

        root.render(element);

        // 延迟获取 canvas，确保渲染完成
        const timer = setTimeout(async () => {
            try {
                if (!stageRef) {
                    throw new Error('Failed to get stage reference');
                }

                // 使用 stage 的 toCanvas 方法
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
