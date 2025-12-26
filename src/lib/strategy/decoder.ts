// copy & modify from https://github.com/Ennea/ffxiv-strategy-board-viewer/blob/master/decoder.ts

import { Base64 } from 'js-base64';
import pako from 'pako';

const FORWARD_TRANSLATION_TABLE = {
    '+': 'N',
    '-': 'P',
    '0': 'x',
    '1': 'g',
    '2': '0',
    '3': 'K',
    '4': '8',
    '5': 'S',
    '6': 'J',
    '7': '2',
    '8': 's',
    '9': 'Z',
    A: 'D',
    B: 'F',
    C: 't',
    D: 'T',
    E: '6',
    F: 'E',
    G: 'a',
    H: 'V',
    I: 'c',
    J: 'p',
    K: 'L',
    L: 'M',
    M: 'm',
    N: 'e',
    O: 'j',
    P: '9',
    Q: 'X',
    R: 'B',
    S: '4',
    T: 'R',
    U: 'Y',
    V: '7',
    W: '_',
    X: 'n',
    Y: 'O',
    Z: 'b',
    a: 'i',
    b: '-',
    c: 'v',
    d: 'H',
    e: 'C',
    f: 'A',
    g: 'r',
    h: 'W',
    i: 'o',
    j: 'd',
    k: 'I',
    l: 'q',
    m: 'h',
    n: 'U',
    o: 'l',
    p: 'k',
    q: '3',
    r: 'f',
    s: 'y',
    t: '5',
    u: 'G',
    v: 'w',
    w: '1',
    x: 'u',
    y: 'z',
    z: 'Q',
};

function translateString(input: string, translationTable: { [key: string]: string }): string {
    let output = '';
    for (const c of input) {
        if (c in translationTable) {
            output += translationTable[c];
        } else {
            output += c;
        }
    }
    return output;
}

function forwardTranslate(input: string): string {
    return translateString(input, FORWARD_TRANSLATION_TABLE);
}

// translates URL-safe base64 to regular base64
function toBase64(input: string): string {
    return translateString(input, { '-': '+', _: '/' });
}

function mapIn(c: string): number {
    if (c >= 'A' && c <= 'Z') return c.charCodeAt(0) - 65;
    if (c >= 'a' && c <= 'z') return c.charCodeAt(0) - 71;
    if (c >= '0' && c <= '9') return c.charCodeAt(0) + 4;
    if (c == '-' || c == '>') return 62;
    if (c == '_' || c == '?') return 63;

    return 0;
}

function mapOut(n: number): string {
    if (n < 26) return String.fromCharCode(n + 65);
    if (n < 52) return String.fromCharCode(n + 71);
    if (n < 62) return String.fromCharCode(n - 52 + 48);
    if (n == 62) return '-';

    return '_';
}

function error(message: string, suppressErrors: boolean) {
    if (suppressErrors) {
        console.error(message);
    } else {
        window.alert(message);
    }
}

export const STRATEGY_BOARD_PREFIX = '[stgy:a';
export const STRATEGY_BOARD_SUFFIX = ']';

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
