const COLLAB_PREFIX = '#/collab/';

export function getCollabRoomFromHash(hash: string): string | undefined {
    if (!hash.startsWith(COLLAB_PREFIX)) {
        return undefined;
    }
    const room = hash.substring(COLLAB_PREFIX.length);
    if (!room) {
        return undefined;
    }
    try {
        return decodeURIComponent(room);
    } catch {
        return room;
    }
}

export function setCollabRoomHash(room: string) {
    location.hash = `${COLLAB_PREFIX}${encodeURIComponent(room)}`;
}

export function getCollabLink(room: string): string {
    return `${location.protocol}//${location.host}${location.pathname}${COLLAB_PREFIX}${encodeURIComponent(room)}`;
}
