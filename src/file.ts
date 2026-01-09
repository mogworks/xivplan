import { Base64 } from 'js-base64';
import { deflate, inflate } from 'pako';

import { FileSource } from './SceneProvider';
import { downloadSceneAsPSD, downloadSceneAsXivplanCn, openFileBlob } from './file/blob';
import { openFileFs, saveFileFs } from './file/filesystem';
import { openFileLocalStorage, saveFileLocalStorage } from './file/localStorage';
import { saveSceneAsPSD } from './file/saveAsPSD';
import { upgradeScene } from './file/upgrade';
import { Scene } from './scene';

export async function saveFile(
    scene: Readonly<Scene>,
    source: FileSource,
    type: 'XivplanCn' | 'PSD' = 'XivplanCn',
): Promise<void> {
    switch (source.type) {
        case 'local':
            await saveFileLocalStorage(scene, source.name);
            break;

        case 'fs':
            switch (type) {
                case 'XivplanCn':
                    await saveFileFs(JSON.stringify(scene, undefined, 2), source.handle);
                    break;
                case 'PSD':
                    await saveFileFs(await saveSceneAsPSD(scene), source.handle);
                    break;
            }
            break;

        case 'blob':
            switch (type) {
                case 'XivplanCn':
                    downloadSceneAsXivplanCn(scene, source.name);
                    break;
                case 'PSD':
                    downloadSceneAsPSD(scene, source.name);
                    break;
            }
            break;
    }
}

export async function openFile(source: FileSource): Promise<Scene> {
    const scene = await openFileUnvalidated(source);
    return upgradeScene(scene);
}

async function openFileUnvalidated(source: FileSource) {
    switch (source.type) {
        case 'local':
            return await openFileLocalStorage(source.name);

        case 'fs':
            return await openFileFs(source.handle);

        case 'blob':
            if (!source.file) {
                throw new Error('File not set');
            }
            return await openFileBlob(source.file);
    }
}

export function sceneToText(scene: Readonly<Scene>): string {
    const compressed = deflate(sceneToJson(scene));

    return Base64.fromUint8Array(compressed, true);
}

export function textToScene(data: string): Scene {
    const decompressed = inflate(Base64.toUint8Array(data));

    return jsonToScene(new TextDecoder().decode(decompressed));
}

export function sceneToJson(scene: Readonly<Scene>): string {
    return JSON.stringify(scene, undefined, 2);
}

export function jsonToScene(json: string): Scene {
    const scene = upgradeScene(JSON.parse(json));

    validateScene(scene);
    return scene;
}

function validateScene(obj: unknown): asserts obj is Scene {
    if (typeof obj !== 'object') {
        throw new Error('Expected an object');
    }

    // TODO: try to check that this is valid data
}
