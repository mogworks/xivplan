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

function forwardTranslate(input: string): string {
    return translateString(input, FORWARD_TRANSLATION_TABLE);
}

// translates URL-safe base64 to regular base64
function toBase64(input: string): string {
    return translateString(input, { '-': '+', _: '/' });
}

function error(message: string, suppressErrors: boolean) {
    if (suppressErrors) {
        console.error(message);
    } else {
        window.alert(message);
    }
}

export function isValidGameStrategyBoardString(shareString: string) {
    return (
        shareString.startsWith(STRATEGY_BOARD_PREFIX) &&
        shareString.endsWith(STRATEGY_BOARD_SUFFIX) &&
        shareString.length >= STRATEGY_BOARD_PREFIX.length + STRATEGY_BOARD_SUFFIX.length + 1
    );
}

export function decodeGameStrategyBoardString(shareString: string, suppressErrors: boolean = false) {
    if (!isValidGameStrategyBoardString(shareString)) {
        error('Invalid strategy board.', suppressErrors);
        return null;
    }

    const buffer = shareString.substring(
        STRATEGY_BOARD_PREFIX.length,
        shareString.length - STRATEGY_BOARD_SUFFIX.length,
    );
    const seed = mapIn(forwardTranslate(buffer[0] ?? '0'));
    const out = new ArrayBuffer(buffer.length - 1);
    const u8View = new Uint8Array(out);

    for (let i = 0; i < buffer.length - 1; i++) {
        const c = buffer[i + 1];
        const t = forwardTranslate(c ?? '0');
        const x = mapIn(t);
        const y = (x - seed - i) & 0x3f;
        u8View[i] = mapOut(y).charCodeAt(0);
    }

    const base64 = new TextDecoder('windows-1252').decode(out);
    try {
        const decoded = Base64.toUint8Array(toBase64(base64));
        const decompressed = pako.inflate(decoded.slice(6));
        if (!decompressed) {
            throw null;
        }

        return decompressed;
    } catch {
        error('Invalid strategy board.', suppressErrors);
        return null;
    }
}
