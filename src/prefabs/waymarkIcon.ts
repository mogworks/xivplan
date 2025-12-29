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
