import { BlobFileSource } from '../SceneProvider';
import { Scene } from '../scene';
import { saveSceneAsPSD } from './saveAsPSD';

const DEFAULT_FILENAME = 'plan.xivplancn';

export function getBlobSource(file: File): BlobFileSource;
export function getBlobSource(name?: string | undefined): BlobFileSource;
export function getBlobSource(file: File | string | undefined): BlobFileSource {
    file = file ?? DEFAULT_FILENAME;

    if (typeof file === 'string') {
        return { type: 'blob', name: file };
    }

    return {
        type: 'blob',
        file,
        get name() {
            return file.name;
        },
    };
}

export function downloadScene(scene: Readonly<Scene>, name: string | undefined) {
    name = name ?? DEFAULT_FILENAME;

    if (!name.endsWith('.xivplancn')) {
        name = name + '.xivplancn';
    }

    const json = JSON.stringify(scene, undefined, 2);

    const file = new File([json], name, {
        type: 'application/vnd.xivplancn.plan+json',
    });

    downloadBlob(file, name);
}

export function downloadSceneAsPSD(scene: Readonly<Scene>, name: string | undefined) {
    name = name ?? DEFAULT_FILENAME;

    if (name.endsWith('.xivplancn')) {
        name = name.slice(0, -10);
        name = name + '.psd';
    }
    saveSceneAsPSD(scene).then((blob) => {
        downloadBlob(blob, name!);
    });
}

export function downloadBlob(blob: Blob | MediaSource, name: string) {
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
}

export async function openFileBlob(file: File): Promise<Scene> {
    const json = await file.text();

    return JSON.parse(json) as Scene;
}
