import { Psd, writePsdUint8Array } from 'ag-psd';
import { getCanvasSize } from '../coord';
import { Scene } from '../scene';

export function saveSceneAsPSD(scene: Readonly<Scene>): Blob {
    const size = getCanvasSize(scene);

    //TODO: 根据 scene 内容生成对应的 PSD 图层，目前仅创建一个空白白色画布
    // 创建 PSD 文档
    const psd: Psd = {
        width: size.width,
        height: size.height,
        channels: 3, // RGB
        bitsPerChannel: 8, // 8-bit
        colorMode: 3, // RGB color mode
        children: [],
        canvas: createWhiteCanvas(size.width, size.height),
    };
    const uint8Array = writePsdUint8Array(psd);
    return new Blob([uint8Array], { type: 'image/vnd.adobe.photoshop' });
}

function createWhiteCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
    }
    return canvas;
}
