import { AoeProps } from './lib/aoe/aoeProps';
import { WaymarkType } from './prefabs/waymarkIcon';
import { LayerName } from './render/layers';

export enum FloorShape {
    None = 'none',
    Rectangle = 'rectangle',
    Circle = 'circle',
}

export enum GridType {
    None = 'none',
    Rectangular = 'rectangle',
    Radial = 'radial',
    CustomRectangular = 'custom',
    CustomRadial = 'customRadial',
}

export enum TickType {
    None = 'none',
    Rectangular = 'rectangle',
    Radial = 'radial',
}

export enum ObjectType {
    Undefined = '',
    Arc = 'arc',
    Arrow = 'arrow',
    Circle = 'circle',
    Fan = 'fan',
    Cursor = 'cursor',
    Donut = 'donut',
    Draw = 'draw',
    Enemy = 'enemy',
    Exaflare = 'exaflare',
    Gaze = 'gaze',
    Icon = 'icon',
    Knockback = 'knockback',
    Line = 'line',
    LineKnockAway = 'lineKnockAway',
    LineKnockback = 'lineKnockback',
    LineStack = 'lineStack',
    Marker = 'marker',
    Party = 'party',
    Polygon = 'polygon',
    Proximity = 'proximity',
    Rect = 'rect',
    RightTriangle = 'rightTriangle',
    RotateCCW = 'rotateCCW',
    RotateCW = 'rotateCW',
    Stack = 'stack',
    Starburst = 'starburst',
    Tether = 'tether',
    Text = 'text',
    Tower = 'tower',
    Triangle = 'triangle',
    BoardIcon = 'boardIcon',
    Waymark = 'waymark',
    AoeRect = 'aoeRect',
    AoeLine = 'aoeLine',
    AoeCircle = 'aoeCircle',
    AoeDonut = 'aoeDonut',
    AoeFan = 'aoeFan',
    AoeArc = 'aoeArc',
    MechGaze = 'mechGaze',
    MechStack = 'mechStack',
}

export interface BaseObject {
    readonly id: number;
    readonly opacity: number;
    readonly hide?: boolean;
    readonly layer?: LayerName;
}

export interface UnknownObject extends BaseObject {
    readonly type: ObjectType;
}

function makeObjectTest<T extends UnknownObject>(
    ...types: readonly ObjectType[]
): (object: UnknownObject) => object is T {
    return (object): object is T => types.includes(object.type);
}

export interface BaseGridProps {
    readonly stroke?: string;
    readonly opacity?: number;
}

export interface NoGrid extends BaseGridProps {
    readonly type: GridType.None;
}

export interface RectangularGrid extends BaseGridProps {
    readonly type: GridType.Rectangular;
    readonly rows: number;
    readonly columns: number;
}

export interface RadialGrid extends BaseGridProps {
    readonly type: GridType.Radial;
    readonly angularDivs: number;
    readonly radialDivs: number;
    readonly startAngle?: number;
}

export interface CustomRectangularGrid extends BaseGridProps {
    readonly type: GridType.CustomRectangular;
    readonly rows: number[];
    readonly columns: number[];
}

export interface CustomRadialGrid extends BaseGridProps {
    readonly type: GridType.CustomRadial;
    readonly rings: number[];
    readonly spokes: number[];
}

export type Grid = NoGrid | RectangularGrid | RadialGrid | CustomRectangularGrid | CustomRadialGrid;

export interface NoTicks {
    readonly type: TickType.None;
}

export interface RectangularTicks {
    readonly type: TickType.Rectangular;
    readonly rows: number;
    readonly columns: number;
}

export interface RadialTicks {
    readonly type: TickType.Radial;
    readonly majorStart: number;
    readonly majorCount: number;
    readonly minorStart: number;
    readonly minorCount: number;
}

export type Ticks = NoTicks | RectangularTicks | RadialTicks;

export type Padding = { top: number; bottom: number; left: number; right: number };

export interface Background {
    readonly color?: string;
    readonly opacity?: number;
    readonly padding?: number | Padding;
}

export interface Floor {
    readonly shape: FloorShape;
    readonly color?: string;
    readonly opacity?: number;
    readonly width: number;
    readonly height: number;
}

export interface Texture {
    readonly url?: string;
    readonly opacity?: number;
    readonly offsetX?: number;
    readonly offsetY?: number;
    readonly width?: number;
    readonly height?: number;
}

export interface Arena {
    readonly background?: Background;
    readonly floor?: Floor;
    readonly texture?: Texture;
    readonly grid?: Grid;
    readonly ticks?: Ticks;
}

export interface ArenaPreset extends Arena {
    name: string;
    spoilerFreeName?: string;
    isSpoilerFree?: boolean;
}

export interface NamedObject {
    // Optional user-defined name. If provided, it takes precedence over translated name.
    readonly name?: string;
    // Optional translation key for dynamic localization (old data may not have it).
    readonly defaultNameKey?: string;
}

export interface ColoredObject {
    readonly color: string;
}

export interface HollowObject {
    readonly hollow?: boolean;
}

export interface MoveableObject {
    readonly x: number;
    readonly y: number;
    readonly pinned?: boolean;
}

export interface RotateableObject {
    readonly rotation: number;
}

export interface ResizeableObject extends MoveableObject, RotateableObject {
    readonly width: number;
    readonly height: number;
}

export interface FlipableObject {
    readonly flipHorizontal?: boolean;
    readonly flipVertical?: boolean;
}

export interface RadiusObject extends MoveableObject {
    readonly radius: number;
}

export interface InnerRadiusObject extends MoveableObject {
    readonly innerRadius: number;
}

export interface ImageObject extends ResizeableObject {
    readonly image: string;
}

export interface StackCountObject {
    readonly count: number;
}

/**
 * Special object for treating the cursor location as a tether target.
 */
export interface FakeCursorObject extends MoveableObject, BaseObject {
    readonly type: ObjectType.Cursor;
}

export interface WaymarkObject extends ResizeableObject, BaseObject {
    readonly type: ObjectType.Waymark;
    readonly waymarkType: WaymarkType;
    readonly fgOpacity?: number;
    readonly fgRotation?: number;
    readonly bgOpacity?: number;
    readonly bgRotation?: number;
}
export const isWaymark = makeObjectTest<WaymarkObject>(ObjectType.Waymark);

export interface ArrowObject extends ResizeableObject, ColoredObject, BaseObject {
    readonly type: ObjectType.Arrow;
    readonly arrowBegin?: boolean;
    readonly arrowEnd?: boolean;
}
export const isArrow = makeObjectTest<ArrowObject>(ObjectType.Arrow);

export type TextStyle = 'outline' | 'shadow' | 'plain';

export interface TextObject extends MoveableObject, RotateableObject, ColoredObject, BaseObject {
    readonly type: ObjectType.Text;
    readonly text: string;
    readonly style: TextStyle;
    readonly stroke: string;
    readonly fontSize: number;
    readonly align: string;
}
export const isText = makeObjectTest<TextObject>(ObjectType.Text);

export type Marker = ArrowObject | TextObject;

export interface IconObject extends ImageObject, NamedObject, BaseObject {
    readonly type: ObjectType.Icon;
    readonly iconId?: number;
    readonly maxStacks?: number;
    readonly time?: number;
}
export const isIcon = makeObjectTest<IconObject>(ObjectType.Icon);

export interface BoardIconObject extends ResizeableObject, FlipableObject, NamedObject, BaseObject {
    readonly type: ObjectType.BoardIcon;
    readonly iconId: number;
}
export const isBoardIcon = makeObjectTest<BoardIconObject>(ObjectType.BoardIcon);

export interface PartyObject extends ResizeableObject, BaseObject {
    readonly type: ObjectType.Party;
    readonly iconId: number;
}
export const isParty = makeObjectTest<PartyObject>(ObjectType.Party);

export enum EnemyRingStyle {
    NoDirection = 'none',
    Directional = 'dir',
    Omnidirectional = 'omni',
}

export interface EnemyObject extends RadiusObject, RotateableObject, NamedObject, ColoredObject, BaseObject {
    readonly type: ObjectType.Enemy;
    readonly icon: string;
    readonly ring: EnemyRingStyle;
}
export const isEnemy = makeObjectTest<EnemyObject>(ObjectType.Enemy);

export type Actor = PartyObject | EnemyObject;
export function isActor(object: UnknownObject): object is Actor {
    return isParty(object) || isEnemy(object);
}

export interface AoeRectObject extends Readonly<AoeProps>, ResizeableObject, BaseObject {
    readonly type: ObjectType.AoeRect;
}

export interface AoeLineObject extends Readonly<AoeProps>, LineProps, MoveableObject, RotateableObject, BaseObject {
    readonly type: ObjectType.AoeLine;
}

export interface AoeCircleObject extends Readonly<AoeProps>, RadiusObject, BaseObject {
    readonly type: ObjectType.AoeCircle;
}

export interface AoeDonutObject extends Readonly<AoeProps>, RadiusObject, InnerRadiusObject, BaseObject {
    readonly type: ObjectType.AoeDonut;
}

export interface AoeFanObject extends Readonly<AoeProps>, FanProps, RadiusObject, RotateableObject, BaseObject {
    readonly type: ObjectType.AoeFan;
}

export interface AoeArcObject
    extends Readonly<AoeProps>, FanProps, RadiusObject, InnerRadiusObject, RotateableObject, BaseObject {
    readonly type: ObjectType.AoeArc;
}

export type AoeObject = AoeRectObject | AoeLineObject | AoeCircleObject | AoeDonutObject | AoeFanObject | AoeArcObject;

export const isAoeObject = makeObjectTest<AoeObject>(
    ObjectType.AoeRect,
    ObjectType.AoeLine,
    ObjectType.AoeCircle,
    ObjectType.AoeDonut,
    ObjectType.AoeFan,
    ObjectType.AoeArc,
);

export interface CircleZone extends RadiusObject, ColoredObject, HollowObject, BaseObject {
    readonly type:
        | ObjectType.Circle
        | ObjectType.Proximity
        | ObjectType.Knockback
        | ObjectType.RotateCW
        | ObjectType.RotateCCW;
}
export const isCircleZone = makeObjectTest<CircleZone>(
    ObjectType.Circle,
    ObjectType.Proximity,
    ObjectType.Knockback,
    ObjectType.RotateCW,
    ObjectType.RotateCCW,
);

export interface StackZone extends StackCountObject, RadiusObject, ColoredObject, HollowObject, BaseObject {
    readonly type: ObjectType.Stack;
}
export const isStackZone = makeObjectTest<StackZone>(ObjectType.Stack);

export interface MechStackObject extends ResizeableObject, BaseObject {
    readonly type: ObjectType.MechStack;
}
export const isMechStack = makeObjectTest<MechStackObject>(ObjectType.MechStack);

export interface MechGazeObject extends ResizeableObject, BaseObject {
    readonly type: ObjectType.MechGaze;
    readonly invert?: boolean; // 是否反向
}
export const isMechGaze = makeObjectTest<MechGazeObject>(ObjectType.MechGaze);

export type Mechanics = MechGazeObject | MechStackObject;

export interface GazeObject extends RadiusObject, ColoredObject, HollowObject, BaseObject {
    readonly type: ObjectType.Gaze;
    readonly invert?: boolean;
}
export const isGaze = makeObjectTest<GazeObject>(ObjectType.Gaze);

export interface DonutZone extends RadiusObject, InnerRadiusObject, ColoredObject, HollowObject, BaseObject {
    readonly type: ObjectType.Donut;
}
export const isDonutZone = makeObjectTest<DonutZone>(ObjectType.Donut);

export interface LineProps {
    readonly length: number;
    readonly width: number;
}

export interface LineZone extends LineProps, MoveableObject, ColoredObject, HollowObject, RotateableObject, BaseObject {
    readonly type: ObjectType.Line;
}
export const isLineZone = makeObjectTest<LineZone>(ObjectType.Line);

export interface FanProps {
    readonly fanAngle: number;
}

export interface FanZone extends FanProps, RadiusObject, ColoredObject, HollowObject, RotateableObject, BaseObject {
    readonly type: ObjectType.Fan;
}
export const isFanZone = makeObjectTest<FanZone>(ObjectType.Fan);

export interface ArcZone
    extends FanProps, RadiusObject, ColoredObject, HollowObject, RotateableObject, InnerRadiusObject, BaseObject {
    readonly type: ObjectType.Arc;
}
export const isArcZone = makeObjectTest<ArcZone>(ObjectType.Arc);

export interface RectangleZone extends ResizeableObject, ColoredObject, HollowObject, BaseObject {
    readonly type:
        | ObjectType.Rect
        | ObjectType.LineStack
        | ObjectType.LineKnockback
        | ObjectType.LineKnockAway
        | ObjectType.Triangle
        | ObjectType.RightTriangle;
}

export const isRectangleZone = makeObjectTest<RectangleZone>(
    ObjectType.Rect,
    ObjectType.LineStack,
    ObjectType.LineKnockback,
    ObjectType.LineKnockAway,
    ObjectType.Triangle,
    ObjectType.RightTriangle,
);

export type PolygonOrientation = 'point' | 'side';

export interface PolygonZone extends RadiusObject, ColoredObject, HollowObject, RotateableObject, BaseObject {
    readonly type: ObjectType.Polygon;
    readonly sides: number;
    readonly orient: PolygonOrientation;
}
export const isPolygonZone = makeObjectTest<PolygonZone>(ObjectType.Polygon);

export interface ExaflareZone extends RadiusObject, RotateableObject, ColoredObject, BaseObject {
    readonly type: ObjectType.Exaflare;
    readonly length: number;
    readonly spacing: number;
}
export const isExaflareZone = makeObjectTest<ExaflareZone>(ObjectType.Exaflare);

export interface StarburstZone extends RadiusObject, RotateableObject, ColoredObject, BaseObject {
    readonly type: ObjectType.Starburst;
    readonly spokes: number;
    readonly spokeWidth: number;
}
export const isStarburstZone = makeObjectTest<StarburstZone>(ObjectType.Starburst);

export interface TowerZone extends RadiusObject, ColoredObject, StackCountObject, BaseObject {
    readonly type: ObjectType.Tower;
}
export const isTowerZone = makeObjectTest<TowerZone>(ObjectType.Tower);

export type Zone =
    | CircleZone
    | DonutZone
    | FanZone
    | ArcZone
    | LineZone
    | RectangleZone
    | ExaflareZone
    | StarburstZone
    | TowerZone;
export function isZone(object: UnknownObject): object is Zone {
    return (
        isCircleZone(object) ||
        isDonutZone(object) ||
        isFanZone(object) ||
        isArcZone(object) ||
        isLineZone(object) ||
        isRectangleZone(object) ||
        isExaflareZone(object) ||
        isStarburstZone(object) ||
        isTowerZone(object)
    );
}

export enum TetherType {
    Line = 'line',
    Close = 'close',
    Far = 'far',
    MinusMinus = '--',
    PlusMinus = '+-',
    PlusPlus = '++',
}

export interface Tether extends BaseObject, ColoredObject {
    readonly type: ObjectType.Tether;
    readonly tether: TetherType;
    readonly startId: number;
    readonly endId: number;
    readonly width: number;
}
export const isTether = makeObjectTest<Tether>(ObjectType.Tether);

export interface DrawObject extends ResizeableObject, RotateableObject, ColoredObject, BaseObject {
    readonly type: ObjectType.Draw;
    readonly points: readonly number[];
    readonly brushSize: number;
}
export const isDrawObject = makeObjectTest<DrawObject>(ObjectType.Draw);

export function isNamed<T>(object: T): object is NamedObject & T {
    const obj = object as NamedObject & T;
    // Show NameControl if the object supports naming: either a user-defined name exists
    // or a defaultNameKey is present (new plans). Use property existence check instead of typeof string.
    return !!obj && ('name' in obj || 'defaultNameKey' in obj);
}

export function isLineLike<T>(object: T): object is LineProps & T {
    const obj = object as LineProps & T;
    return obj && typeof obj.length === 'number' && typeof obj.width === 'number';
}

export function isFanLike<T>(object: T): object is FanProps & T {
    const obj = object as FanProps & T;
    return obj && typeof obj.fanAngle === 'number';
}

export function isColored<T>(object: T): object is ColoredObject & T {
    const obj = object as ColoredObject & T;
    return obj && typeof obj.color === 'string';
}

export function isMoveable<T>(object: T): object is MoveableObject & T {
    const obj = object as MoveableObject & T;
    return obj && typeof obj.x === 'number' && typeof obj.y === 'number';
}

export function isRotateable<T>(object: T): object is RotateableObject & T {
    const obj = object as RotateableObject & T;
    return obj && typeof obj.rotation === 'number';
}

export function isResizable<T>(object: T): object is ResizeableObject & T {
    if (!isMoveable(object) || !isRotateable(object)) {
        return false;
    }

    const obj = object as ResizeableObject & T;
    return obj && typeof obj.width === 'number' && typeof obj.height === 'number';
}

export function isRadiusObject<T>(object: T): object is RadiusObject & T {
    if (!isMoveable(object)) {
        return false;
    }

    const obj = object as RadiusObject & T;
    return obj && typeof obj.radius === 'number';
}

export function isInnerRadiusObject<T>(object: T): object is InnerRadiusObject & T {
    if (!isMoveable(object)) {
        return false;
    }

    const obj = object as InnerRadiusObject & T;
    return obj && typeof obj.innerRadius === 'number';
}

export function isImageObject<T>(object: T): object is ImageObject & T {
    const obj = object as ImageObject & T;
    return obj && typeof obj.image === 'string';
}

export const supportsHollow = makeObjectTest<HollowObject & UnknownObject>(
    ObjectType.Circle,
    ObjectType.RotateCW,
    ObjectType.RotateCCW,
    ObjectType.Fan,
    ObjectType.Arc,
    ObjectType.Line,
    ObjectType.Rect,
    ObjectType.Triangle,
    ObjectType.RightTriangle,
    ObjectType.Polygon,
    ObjectType.Donut,
);

export function supportsStackCount<T>(object: T): object is StackCountObject & T {
    const obj = object as StackCountObject & T;
    return obj && typeof obj.count === 'number';
}

export type SceneObject =
    | UnknownObject
    | Zone
    | Marker
    | Actor
    | IconObject
    | Tether
    | BoardIconObject
    | WaymarkObject
    | AoeObject
    | Mechanics;

export type SceneObjectWithoutId = Omit<SceneObject, 'id'> & { id?: number };

export interface SceneStep {
    readonly objects: readonly SceneObject[];
}

export interface Scene {
    readonly nextId: number;
    readonly arena: Arena;
    readonly steps: SceneStep[];
}

export const NO_GRID: NoGrid = {
    type: GridType.None,
};

export const DEFAULT_RECT_GRID: RectangularGrid = {
    type: GridType.Rectangular,
    rows: 4,
    columns: 4,
};

export const DEFAULT_RADIAL_GRID: RadialGrid = {
    type: GridType.Radial,
    angularDivs: 8,
    radialDivs: 2,
};

export const DEFAULT_CUSTOM_RECT_GRID: CustomRectangularGrid = {
    type: GridType.CustomRectangular,
    rows: [-150, 0, 150],
    columns: [-150, 0, 150],
};

export const DEFAULT_CUSTOM_RADIAL_GRID: CustomRadialGrid = {
    type: GridType.CustomRadial,
    rings: [150, 450],
    spokes: [0, 45, 90, 135, 180, 225, 270, 315],
};

export const NO_TICKS: NoTicks = {
    type: TickType.None,
};

export const DEFAULT_RECT_TICKS: RectangularTicks = {
    type: TickType.Rectangular,
    rows: 20,
    columns: 20,
};

export const DEFAULT_RADIAL_TICKS: RadialTicks = {
    type: TickType.Radial,
    majorStart: 0,
    majorCount: 8,
    minorStart: 0,
    minorCount: 72,
};

export const DEFAULT_FLOOR: Floor = {
    shape: FloorShape.Rectangle,
    width: 400,
    height: 400,
};

export const DEFAULT_ARENA_PADDING = 120;

export const DEFAULT_ARENA: Arena = {
    floor: {
        shape: FloorShape.Rectangle,
        width: 600,
        height: 600,
    },
    grid: DEFAULT_RECT_GRID,
};

export const DEFAULT_SCENE: Scene = {
    nextId: 1,
    arena: DEFAULT_ARENA,
    steps: [{ objects: [] }],
};
