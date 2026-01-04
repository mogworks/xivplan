import { Vector2d } from 'konva/lib/types';
import {
    DrawObject,
    ExaflareZone,
    ImageObject,
    PartyObject,
    PolygonOrientation,
    PolygonZone,
    Scene,
    SceneObject,
    SceneStep,
    StackZone,
    TargetObject,
    TargetRingStyle,
    TextObject,
    TextStyle,
    isDrawObject,
    isExaflareZone,
    isImageObject,
    isParty,
    isPolygonZone,
    isStackZone,
    isTarget,
    isText,
} from '../scene';
import { DEFAULT_IMAGE_OPACITY, DEFAULT_PARTY_OPACITY, DEFAULT_TARGET_OPACITY } from '../theme';

export function upgradeScene(scene: Scene): Scene {
    return {
        ...scene,
        steps: scene.steps.map(upgradeStep),
    };
}

function upgradeStep(step: SceneStep): SceneStep {
    return {
        ...step,
        objects: step.objects.map(upgradeObject),
    };
}

function upgradeObject(object: SceneObject): SceneObject {
    if (isTarget(object)) {
        object = upgradeTarget(object);
    }

    if (isParty(object)) {
        object = upgradeParty(object);
    }

    if (isDrawObject(object)) {
        object = upgradeDrawObject(object);
    }

    if (isImageObject(object)) {
        object = upgradeImageObject(object);
    }

    if (isExaflareZone(object)) {
        object = upgradeExaflareZone(object);
    }

    if (isText(object)) {
        object = upgradeText(object);
    }

    if (isPolygonZone(object)) {
        object = upgradePolygon(object);
    }

    if (isStackZone(object)) {
        object = upgradeStackZone(object);
    }

    return object;
}

// TargetObject was changed from { rotation?: number }
// to { rotation: number, omniDirection: boolean, opacity: number }, then
// to { rotation: number, ring: TargetRingStyle, opacity: number }
type LegacyTargetObject = Omit<TargetObject, 'opacity' | 'rotation' | 'ring'> & {
    opacity?: number;
    rotation?: number;
    omniDirection?: boolean;
    ring?: TargetRingStyle;
};

function getRingStyle<T extends LegacyTargetObject>(object: T): TargetRingStyle {
    if (object.rotation === undefined) {
        return TargetRingStyle.NoDirection;
    }

    if ('omniDirection' in object && typeof object.omniDirection === 'boolean') {
        return object.omniDirection ? TargetRingStyle.NoDirection : TargetRingStyle.Directional;
    }

    return TargetRingStyle.Directional;
}

function upgradeTarget(object: LegacyTargetObject): TargetObject {
    return {
        ...object,
        rotation: object.rotation ?? 0,
        ring: object.ring ?? getRingStyle(object),
        opacity: object.opacity ?? DEFAULT_TARGET_OPACITY,
    };
}

// DrawObject was changed from { points: Vector2d[] }
// to { points: number[] }
type DrawObjectV1 = Omit<DrawObject, 'points'> & {
    points: readonly Vector2d[];
};

function isDrawObjectV1(object: DrawObject | DrawObjectV1): object is DrawObjectV1 {
    return object.points.length > 0 && typeof object.points[0] === 'object';
}

function upgradeDrawObject(object: DrawObject | DrawObjectV1): DrawObject {
    if (isDrawObjectV1(object)) {
        const points: number[] = [];
        for (const point of object.points) {
            points.push(point.x, point.y);
        }

        return { ...object, points };
    }

    return object;
}

const DEPRECATED_IMAGE_PATTERNS = [
    /https:\/\/xivapi\.com\/i\/(\w+)\/(\w+)\.png/,
    /https:\/\/beta\.xivapi\.com\/api\/1\/.*\/(\w+)\/(\w+)\.tex\?format=png/,
];

// opacity property was added to ImageObject.
// Status icons from legacy XIVAPI did not support CORS and would not render.
// The beta XIVAPI is now broken and replaced by V2.
function upgradeImageObject<T extends ImageObject>(object: T): T {
    // Replace status icons from the XIVAPI V1 or beta APIs with ones from the V2 API.
    let image = object.image;

    for (const pattern of DEPRECATED_IMAGE_PATTERNS) {
        image = image.replace(pattern, (match, folder, name) => {
            return `https://v2.xivapi.com/api/asset/ui/icon/${folder}/${name}.tex?format=png`;
        });
    }

    return {
        opacity: DEFAULT_IMAGE_OPACITY,
        ...object,
        image,
    };
}

// spacing property was added to ExaflareZone
type LegacyExaflareZone = Omit<ExaflareZone, 'spacing'> & {
    spacing?: number;
};

function upgradeExaflareZone(object: LegacyExaflareZone): ExaflareZone {
    return {
        spacing: 60,
        ...object,
    };
}

// opacity property was added to PartyObject
type LegacyPartyObject = Omit<PartyObject, 'opacity'> & {
    opacity?: number;
};

function upgradeParty(object: LegacyPartyObject): PartyObject {
    return {
        opacity: DEFAULT_PARTY_OPACITY,
        ...object,
    };
}

// stroke and style properties were added to TextObject
type LegacyTextObject = Omit<TextObject, 'stroke' | 'style'> & {
    stroke?: string;
    style?: TextStyle;
};

function upgradeText(object: LegacyTextObject): TextObject {
    return {
        stroke: '#40352c',
        style: 'outline',
        ...object,
    };
}

// orient property was added to PolygonZone
type LegacyPolygonZone = Omit<PolygonZone, 'orient'> & {
    orient?: PolygonOrientation;
};

function upgradePolygon(object: LegacyPolygonZone): PolygonZone {
    return {
        orient: 'point',
        ...object,
    };
}

// StackZone was split off from CircleZone
// count property was added
type LegacyStackZone = Omit<StackZone, 'count'> & {
    count?: number;
};

function upgradeStackZone(object: LegacyStackZone): StackZone {
    return {
        count: 1,
        ...object,
    };
}
