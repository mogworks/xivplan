import { StrategyBoard } from './common';

export function buildStrategyBoardData(board: StrategyBoard) {
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

    // Section 1: 板名 (需要 4 字节对齐)
    view.setUint16(pos, 1, true);
    pos += 2;
    const cleanName = (board.boardName || '').replace(/\0+$/, '');
    const nameBytes = new TextEncoder().encode(cleanName);
    const namePaddedLen = Math.ceil((nameBytes.length + 1) / 4) * 4;
    view.setUint16(pos, namePaddedLen, true);
    pos += 2;
    data.set(nameBytes, pos);
    for (let i = nameBytes.length; i < namePaddedLen; i++) {
        data[pos + i] = 0;
    }
    pos += namePaddedLen;

    // 对象列表
    for (const obj of objects) {
        view.setUint16(pos, 2, true);
        pos += 2;
        view.setUint16(pos, obj.id, true);
        pos += 2;

        if (obj.id === 100) {
            view.setUint16(pos, 3, true);
            pos += 2; // 必须是 3
            // 去掉末尾的NULL，编码字符串（处理空字符串情况）
            const cleanString = (obj.string || '').replace(/\0+$/, '');
            const strBytes = new TextEncoder().encode(cleanString);
            // 对齐到 4 字节边界（至少 1 个 NULL）
            const paddedLen = Math.ceil((strBytes.length + 1) / 4) * 4;
            view.setUint16(pos, paddedLen, true);
            pos += 2;
            data.set(strBytes, pos);
            // 剩余部分填充 NULL
            for (let i = strBytes.length; i < paddedLen; i++) {
                data[pos + i] = 0;
            }
            pos += paddedLen;
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
        let flags = 0x0001;
        if (!obj.flags.visible) flags |= 0x0100;
        if (obj.flags.flipHorizontal) flags |= 0x0200;
        if (obj.flags.flipVertical) flags |= 0x0400;
        if (obj.flags.locked) flags |= 0x0800;
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
        const x = Math.round(obj.coordinates.x);
        const y = Math.round(obj.coordinates.y);
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
        const angle = Math.round(obj.angle);
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
        data[pos] = Math.round(obj.scale);
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
        data[pos] = Math.round(obj.color.red);
        pos += 1;
        data[pos] = Math.round(obj.color.green);
        pos += 1;
        data[pos] = Math.round(obj.color.blue);
        pos += 1;
        data[pos] = 100 - Math.round(obj.color.opacity);
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
        view.setUint16(pos, Math.round(obj.param1 || 0), true);
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
        view.setUint16(pos, Math.round(obj.param2 || 0), true);
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
        view.setUint16(pos, Math.round(obj.param3 || 0), true);
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
