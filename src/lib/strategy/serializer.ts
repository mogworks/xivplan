import { StrategyBoard } from './common';

export function encodeStrategyBoardData(board: StrategyBoard): Uint8Array {
    const objects = [...board.objects].reverse();
    const objCount = objects.length;

    // 估算大小并创建缓冲区
    const buffer = new ArrayBuffer(1024 + objCount * 50);
    const view = new DataView(buffer);
    const data = new Uint8Array(buffer);
    let pos = 0;

    // 头部 (24字节)
    view.setUint32(pos, 2, true);
    pos += 4; // header_magic
    const length1Pos = pos;
    pos += 2; // length1 占位
    pos += 12; // unk
    const length2Pos = pos;
    pos += 2; // length2 占位
    pos += 4; // unk

    // Section 1: 板名
    view.setUint16(pos, 1, true);
    pos += 2;
    const nameBytes = new TextEncoder().encode('未命名' + '\0');
    view.setUint16(pos, nameBytes.length, true);
    pos += 2;
    data.set(nameBytes, pos);
    pos += nameBytes.length;

    // 对象列表
    for (const obj of objects) {
        view.setUint16(pos, 2, true);
        pos += 2;
        view.setUint16(pos, obj.id, true);
        pos += 2;

        if (obj.id === 100 && obj.string) {
            view.setUint16(pos, 0, true);
            pos += 2;
            const strBytes = new TextEncoder().encode(obj.string + '\0');
            view.setUint16(pos, strBytes.length, true);
            pos += 2;
            data.set(strBytes, pos);
            pos += strBytes.length;
        }
    }

    // Section 4: 标志
    view.setUint16(pos, 4, true);
    pos += 2;
    view.setUint16(pos, 1, true);
    pos += 2;
    view.setUint16(pos, objCount, true);
    pos += 2;
    for (const obj of objects) {
        let flags = 0x0000;
        if (obj.flags.visible) flags |= 0x0001;
        if (obj.flags.flipHorizontal) flags |= 0x0002;
        if (obj.flags.flipVertical) flags |= 0x0004;
        if (obj.flags.locked) flags |= 0x0008;
        view.setUint16(pos, flags, true);
        pos += 2;
    }

    // Section 5: 坐标
    view.setUint16(pos, 5, true);
    pos += 2;
    view.setUint16(pos, 3, true);
    pos += 2;
    view.setUint16(pos, objCount, true);
    pos += 2;
    for (const obj of objects) {
        const x = obj.coordinates.x;
        const y = obj.coordinates.y;
        view.setUint16(pos, x, true);
        pos += 2;
        view.setUint16(pos, y, true);
        pos += 2;
    }

    // Section 6: 角度
    view.setUint16(pos, 6, true);
    pos += 2;
    view.setUint16(pos, 1, true);
    pos += 2;
    view.setUint16(pos, objCount, true);
    pos += 2;
    for (const obj of objects) {
        const angle = obj.angle;
        view.setInt16(pos, angle, true);
        pos += 2;
    }

    // Section 7: 缩放
    view.setUint16(pos, 7, true);
    pos += 2;
    view.setUint16(pos, 0, true);
    pos += 2;
    view.setUint16(pos, objCount, true);
    pos += 2;
    for (const obj of objects) {
        data[pos] = obj.scale;
        pos += 1;
    }
    if (objCount % 2 === 1) pos += 1;

    // Section 8: 颜色
    view.setUint16(pos, 8, true);
    pos += 2;
    view.setUint16(pos, 2, true);
    pos += 2;
    view.setUint16(pos, objCount, true);
    pos += 2;
    for (const obj of objects) {
        data[pos] = obj.color.red;
        pos += 1;
        data[pos] = obj.color.green;
        pos += 1;
        data[pos] = obj.color.blue;
        pos += 1;
        data[pos] = 100 - obj.color.opacity;
        pos += 1;
    }

    // Section 10: param1
    view.setUint16(pos, 10, true);
    pos += 2;
    view.setUint16(pos, 1, true);
    pos += 2;
    view.setUint16(pos, objCount, true);
    pos += 2;
    for (const obj of objects) {
        view.setUint16(pos, obj.param1 || 0, true);
        pos += 2;
    }

    // Section 11: param2
    view.setUint16(pos, 11, true);
    pos += 2;
    view.setUint16(pos, 1, true);
    pos += 2;
    view.setUint16(pos, objCount, true);
    pos += 2;
    for (const obj of objects) {
        view.setUint16(pos, obj.param2 || 0, true);
        pos += 2;
    }

    // Section 12: param3
    view.setUint16(pos, 12, true);
    pos += 2;
    view.setUint16(pos, 1, true);
    pos += 2;
    view.setUint16(pos, objCount, true);
    pos += 2;
    for (const obj of objects) {
        view.setUint16(pos, obj.param3 || 0, true);
        pos += 2;
    }

    // Footer
    view.setUint16(pos, 3, true);
    pos += 2;
    view.setUint16(pos, 1, true);
    pos += 2;
    view.setUint16(pos, 1, true);
    pos += 2;
    view.setUint16(pos, board.background || 1, true);
    pos += 2;

    // 填充 length1 和 length2
    const totalLen = pos;
    view.setUint16(length1Pos, totalLen - 16, true);
    view.setUint16(length2Pos, totalLen - 28, true);

    return data.slice(0, pos);
}
