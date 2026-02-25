import type { WaymarkGroupObject } from '../scene';

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

export enum WaymarkPlacementType {
    Circle = 'circle',
    Square = 'square',
}

export enum WaymarkOrderType {
    A2B3 = 'A2B3',
    A1B2 = 'A1B2',
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

export const getWaymarkIdByType = (type: WaymarkType): WaymarkId => {
    switch (type) {
        case WaymarkType.A:
            return WaymarkId.A;
        case WaymarkType.B:
            return WaymarkId.B;
        case WaymarkType.C:
            return WaymarkId.C;
        case WaymarkType.D:
            return WaymarkId.D;
        case WaymarkType.One:
            return WaymarkId.One;
        case WaymarkType.Two:
            return WaymarkId.Two;
        case WaymarkType.Three:
            return WaymarkId.Three;
        case WaymarkType.Four:
            return WaymarkId.Four;
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
    new URL(`board/extra/waymark/${bg ? 'bg' : 'fg'}/${type}.webp`, import.meta.env.VITE_COS_URL).href;

export const getWaymarkOffsetsFromGroup = (object: WaymarkGroupObject) => {
    const r = object.radius;
    const c = (Math.SQRT2 / 2) * object.radius;
    return [
        {
            type: WaymarkType.A,
            x: 0,
            y: -r,
        },
        {
            type: WaymarkType.B,
            x: r,
            y: 0,
        },
        {
            type: WaymarkType.C,
            x: 0,
            y: r,
        },
        {
            type: WaymarkType.D,
            x: -r,
            y: 0,
        },
        {
            type: WaymarkType.One,
            x:
                object.placementType === WaymarkPlacementType.Circle
                    ? object.orderType === WaymarkOrderType.A2B3
                        ? -c
                        : c
                    : object.orderType === WaymarkOrderType.A2B3
                      ? -r
                      : r,
            y: object.placementType === WaymarkPlacementType.Circle ? -c : -r,
        },
        {
            type: WaymarkType.Two,
            x: object.placementType === WaymarkPlacementType.Circle ? c : r,
            y:
                object.placementType === WaymarkPlacementType.Circle
                    ? object.orderType === WaymarkOrderType.A2B3
                        ? -c
                        : c
                    : object.orderType === WaymarkOrderType.A2B3
                      ? -r
                      : r,
        },
        {
            type: WaymarkType.Three,
            x:
                object.placementType === WaymarkPlacementType.Circle
                    ? object.orderType === WaymarkOrderType.A2B3
                        ? c
                        : -c
                    : object.orderType === WaymarkOrderType.A2B3
                      ? r
                      : -r,
            y: object.placementType === WaymarkPlacementType.Circle ? c : r,
        },
        {
            type: WaymarkType.Four,
            x: object.placementType === WaymarkPlacementType.Circle ? -c : -r,
            y:
                object.placementType === WaymarkPlacementType.Circle
                    ? object.orderType === WaymarkOrderType.A2B3
                        ? c
                        : -c
                    : object.orderType === WaymarkOrderType.A2B3
                      ? r
                      : -r,
        },
    ];
};
