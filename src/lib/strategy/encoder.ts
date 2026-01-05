// copy & modify from https://github.com/Ennea/ffxiv-strategy-board-viewer/blob/master/decoder.ts

import pako from 'pako';
import { FORWARD_TRANSLATION_TABLE, mapIn, mapOut, translateString } from './common';

const REVERSE_TRANSLATION_TABLE: { [key: string]: string } = {};

// Build reverse translation table
for (const [key, value] of Object.entries(FORWARD_TRANSLATION_TABLE)) {
    REVERSE_TRANSLATION_TABLE[value] = key;
}

function reverseTranslate(input: string): string {
    return translateString(input, REVERSE_TRANSLATION_TABLE);
}

// translates regular base64 to URL-safe base64
function fromBase64(input: string): string {
    return translateString(input, { '+': '-', '/': '_' });
}

function zlibCompress(data: Uint8Array<ArrayBuffer>) {
    const input = data instanceof Uint8Array ? data : new Uint8Array(data);
    return pako.deflate(input);
}

const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    CRC32_TABLE[i] = c;
}

function crc32(data: Uint8Array<ArrayBuffer>) {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
        crc = CRC32_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function base64Encode(bytes: Uint8Array<ArrayBuffer>) {
    let binaryStr = '';
    for (let i = 0; i < bytes.length; i++) {
        binaryStr += String.fromCharCode(bytes[i]!);
    }
    return btoa(binaryStr);
}

export function encodeShareString(binaryData: Uint8Array<ArrayBuffer>) {
    // zlib 压缩
    const compressed = zlibCompress(binaryData);

    // 构建头部
    const length = binaryData.length;
    const lengthBytes = new Uint8Array(2);
    lengthBytes[0] = length & 0xff;
    lengthBytes[1] = (length >> 8) & 0xff;

    // 计算 CRC32
    const crcData = new Uint8Array(lengthBytes.length + compressed.length);
    crcData.set(lengthBytes, 0);
    crcData.set(compressed, 2);
    const crc32Value = crc32(crcData);

    const val1 = crc32Value & 0xffff;
    const val2 = (crc32Value >> 16) & 0xffff;

    // 构建完整数据
    const withHeader = new Uint8Array(6 + compressed.length);
    withHeader[0] = val1 & 0xff;
    withHeader[1] = (val1 >> 8) & 0xff;
    withHeader[2] = val2 & 0xff;
    withHeader[3] = (val2 >> 8) & 0xff;
    withHeader[4] = length & 0xff;
    withHeader[5] = (length >> 8) & 0xff;
    withHeader.set(compressed, 6);

    // Base64 编码
    const base64Str = base64Encode(withHeader);
    const urlSafe = fromBase64(base64Str).replace(/=+$/, '');

    // XOR 编码
    const seed = Math.floor(Math.random() * 64);
    let encoded = reverseTranslate(mapOut(seed));

    for (let i = 0; i < urlSafe.length; i++) {
        const y = mapIn(urlSafe[i]!);
        const x = (y + seed + i) & 0x3f;
        encoded += reverseTranslate(mapOut(x));
    }

    return `[stgy:a${encoded}]`;
}
