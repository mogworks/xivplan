// copy & modify from https://github.com/Ennea/ffxiv-strategy-board-viewer/blob/master/decoder.ts

import { Base64 } from 'js-base64';
import pako from 'pako';
import {
    FORWARD_TRANSLATION_TABLE,
    mapIn,
    mapOut,
    STRATEGY_BOARD_PREFIX,
    STRATEGY_BOARD_SUFFIX,
    translateString,
} from './common';

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

export function encodeGameStrategyBoardString(data: Uint8Array, seed: number = 0): string {
    try {
        // Compress the data
        const compressed = pako.deflate(data);
        // Prepend 6 bytes (original decoder skips first 6 bytes)
        const prepended = new Uint8Array(6 + compressed.length);
        prepended.set(compressed, 6);
        // Convert to base64
        const base64 = Base64.fromUint8Array(prepended);
        // Convert to URL-safe base64
        const urlSafeBase64 = fromBase64(base64);
        // Convert to array buffer
        const out = new ArrayBuffer(urlSafeBase64.length);
        const u8View = new Uint8Array(out);
        for (let i = 0; i < urlSafeBase64.length; i++) {
            u8View[i] = urlSafeBase64.charCodeAt(i);
        }
        // Convert to windows-1252 string
        const windows1252 = new TextDecoder('windows-1252').decode(out);
        // Process each character
        const buffer: string[] = [];
        for (let i = 0; i < windows1252.length; i++) {
            const c = windows1252[i];
            const x = mapIn(c!);
            const y = (x + seed + i) & 0x3f;
            buffer.push(mapOut(y));
        }
        // Reverse translate the buffer
        const translated = reverseTranslate(buffer.join(''));
        // Prepend the seed character
        const seedChar = reverseTranslate(mapOut(seed));
        // Build the final string
        return `${STRATEGY_BOARD_PREFIX}${seedChar}${translated}${STRATEGY_BOARD_SUFFIX}`;
    } catch (e) {
        console.error('Error encoding strategy board:', e);
        return '';
    }
}
