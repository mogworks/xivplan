export enum WaymarkId {
    A = 79,
    B,
    C,
    D,
    One,
    Two,
    Three,
    Four,
}

export enum WaymarkType {
    A = 'a',
    B = 'b',
    C = 'c',
    D = 'd',
    One = '1',
    Two = '2',
    Three = '3',
    Four = '4',
}

export enum WaymarkShape {
    Square = 'square',
    Circle = 'circle',
}

export const getWaymarkTypeById = (id: WaymarkId): WaymarkType => {
    switch (id) {
        case WaymarkId.A:
            return WaymarkType.A;
        case WaymarkId.B:
            return WaymarkType.B;
        case WaymarkId.C:
            return WaymarkType.C;
        case WaymarkId.D:
            return WaymarkType.D;
        case WaymarkId.One:
            return WaymarkType.One;
        case WaymarkId.Two:
            return WaymarkType.Two;
        case WaymarkId.Three:
            return WaymarkType.Three;
        case WaymarkId.Four:
            return WaymarkType.Four;
    }
};

export const getWaymarkShape = (type: WaymarkType): WaymarkShape => {
    switch (type) {
        case WaymarkType.A:
        case WaymarkType.B:
        case WaymarkType.C:
        case WaymarkType.D:
            return WaymarkShape.Circle;
        case WaymarkType.One:
        case WaymarkType.Two:
        case WaymarkType.Three:
        case WaymarkType.Four:
            return WaymarkShape.Square;
    }
};

export const getWaymarkIconUrl = (type: WaymarkType, bg?: boolean) =>
    new URL(`public/board/extra/waymark/${bg ? 'bg' : 'fg'}/${type}.webp`, import.meta.env.VITE_COS_URL).href;
