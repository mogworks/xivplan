import { AoeProps } from './lib/aoe/aoeProps';
import { WaymarkOrderType, WaymarkPlacementType, WaymarkType } from './prefabs/waymarkIcon';
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
    Target = 'target',
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
    Asset = 'asset',
    Waymark = 'waymark',
    WaymarkGroup = 'waymarkGroup',
    AoeRect = 'aoeRect',
    AoeLine = 'aoeLine',
    AoeCircle = 'aoeCircle',
    AoeDonut = 'aoeDonut',
    AoeFan = 'aoeFan',
    AoeArc = 'aoeArc',
    AoePolygon = 'aoePolygon',
    AoeStarburst = 'aoeStarburst',
    MechGaze = 'mechGaze',
    MechProximity = 'mechProximity',
    MechRadialKnockback = 'mechRadialKnockback',
    MechLinearKnockback = 'mechLinearKnockback',
    MechTower = 'mechTower',
    MechCounterTower = 'mechCounterTower',
    MechCircleExaflare = 'mechCircleExaflare',
    MechRotation = 'mechRotation',
    IndicatorStack = 'indicatorStack',
    IndicatorLineStack = 'indicatorLineStack',
    IndicatorTargeting = 'indicatorTargeting',
    IndicatorTankbuster = 'indicatorTankbuster',
    IndicatorProximity = 'indicatorProximity',
    IndicatorMarker = 'indicatorMarker',
    Enemy = 'enemy',
}

export interface BaseObject {
    readonly id: number;
    readonly opacity: number;
    readonly hide?: boolean;
    readonly layer?: LayerName;
    readonly groupId?: string;
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
    key?: string;
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

export interface MovableObject {
    readonly x: number;
    readonly y: number;
    readonly pinned?: boolean;
}

export interface RotatableObject {
    readonly rotation: number;
}

export interface ResizableObject extends MovableObject, RotatableObject {
    readonly width: number;
    readonly height: number;
}

export interface RegularResizableObject extends MovableObject, RotatableObject {
    readonly size: number;
}

export interface HorizontalFlippable {
    readonly flipHorizontal?: boolean;
}

export interface VerticalFlippable {
    readonly flipVertical?: boolean;
}

export interface FlippableObject extends HorizontalFlippable, VerticalFlippable {}

export interface RadiusObject extends MovableObject {
    readonly radius: number;
}

export interface InnerRadiusObject extends MovableObject {
    readonly innerRadius: number;
}

export interface ImageObject extends ResizableObject {
    readonly image: string;
}

export interface StackCountObject {
    readonly count: number;
    readonly countValues?: number[];
}

/**
 * Special object for treating the cursor location as a tether target.
 */
export interface FakeCursorObject extends MovableObject, BaseObject {
    readonly type: ObjectType.Cursor;
}

export interface WaymarkObject extends RegularResizableObject, BaseObject {
    readonly type: ObjectType.Waymark;
    readonly waymarkType: WaymarkType;
    readonly fgOpacity?: number;
    readonly fgRotation?: number;
    readonly bgOpacity?: number;
    readonly bgRotation?: number;
}
export const isWaymark = makeObjectTest<WaymarkObject>(ObjectType.Waymark);

export interface WaymarkGroupObject extends RadiusObject, RegularResizableObject, BaseObject {
    readonly type: ObjectType.WaymarkGroup;
    readonly orderType: WaymarkOrderType;
    readonly placementType: WaymarkPlacementType;
    readonly fgOpacity?: number;
    readonly fgRotation?: number;
    readonly bgOpacity?: number;
    readonly bgRotation?: number;
}
export const isWaymarkGroup = makeObjectTest<WaymarkGroupObject>(ObjectType.WaymarkGroup);

export interface ArrowObject extends ResizableObject, ColoredObject, BaseObject {
    readonly type: ObjectType.Arrow;
    readonly arrowBegin?: boolean;
    readonly arrowEnd?: boolean;
}
export const isArrow = makeObjectTest<ArrowObject>(ObjectType.Arrow);

export type TextStyle = 'outline' | 'shadow' | 'plain';

export interface TextObject extends MovableObject, RotatableObject, ColoredObject, BaseObject {
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

export interface HorizontalExtendable {
    readonly hNum?: number; // Horizontal number of icons
}

export interface VerticalExtendable {
    readonly vNum?: number; // Vertical number of icons
}

export interface ExtendableObject extends HorizontalExtendable, VerticalExtendable {}

export interface BoardIconObject
    extends RegularResizableObject, ExtendableObject, FlippableObject, NamedObject, BaseObject {
    readonly type: ObjectType.BoardIcon;
    readonly iconId: number;
}
export const isBoardIcon = makeObjectTest<BoardIconObject>(ObjectType.BoardIcon);

export interface Asset
    extends ImageObject, ResizableObject, ExtendableObject, FlippableObject, NamedObject, BaseObject {
    readonly type: ObjectType.Asset;
}
export const isAsset = makeObjectTest<Asset>(ObjectType.Asset);

export interface EnemyObject extends RegularResizableObject, BaseObject {
    readonly type: ObjectType.Enemy;
    readonly iconId: number;
}
export const isEnemy = makeObjectTest<EnemyObject>(ObjectType.Enemy);

export interface PartyObject extends RegularResizableObject, BaseObject {
    readonly type: ObjectType.Party;
    readonly iconId: number;
}
export const isParty = makeObjectTest<PartyObject>(ObjectType.Party);

export enum TargetRingStyle {
    NoDirection = 'none',
    Directional = 'dir',
    Omnidirectional = 'omni',
}

export interface TargetObject extends RadiusObject, RotatableObject, NamedObject, ColoredObject, BaseObject {
    readonly type: ObjectType.Target;
    readonly icon: string;
    readonly ring: TargetRingStyle;
}
export const isTarget = makeObjectTest<TargetObject>(ObjectType.Target);

export type Actor = PartyObject | TargetObject;
export function isActor(object: UnknownObject): object is Actor {
    return isParty(object) || isTarget(object);
}

export interface AoeRectObject extends Readonly<AoeProps>, ResizableObject, BaseObject {
    readonly type: ObjectType.AoeRect;
}

export interface AoeLineObject extends Readonly<AoeProps>, LineProps, MovableObject, RotatableObject, BaseObject {
    readonly type: ObjectType.AoeLine;
}

export interface AoePolygonObject extends Readonly<AoeProps>, PolygonProps, RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.AoePolygon;
}

export interface AoeStarburstObject
    extends Readonly<AoeProps>, StarburstProps, RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.AoeStarburst;
}

export interface AoeCircleObject extends Readonly<AoeProps>, RadiusObject, BaseObject {
    readonly type: ObjectType.AoeCircle;
}

export interface AoeDonutObject extends Readonly<AoeProps>, RadiusObject, InnerRadiusObject, BaseObject {
    readonly type: ObjectType.AoeDonut;
}

export interface AoeFanObject extends Readonly<AoeProps>, FanProps, RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.AoeFan;
}

export interface AoeArcObject
    extends Readonly<AoeProps>, FanProps, RadiusObject, InnerRadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.AoeArc;
}

export type Aoe =
    | AoeRectObject
    | AoeLineObject
    | AoeCircleObject
    | AoeDonutObject
    | AoeFanObject
    | AoeArcObject
    | AoePolygonObject
    | AoeStarburstObject;

export const isAoeObject = makeObjectTest<Aoe>(
    ObjectType.AoeRect,
    ObjectType.AoeLine,
    ObjectType.AoeCircle,
    ObjectType.AoeDonut,
    ObjectType.AoeFan,
    ObjectType.AoeArc,
    ObjectType.AoePolygon,
    ObjectType.AoeStarburst,
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

export interface IndicatorStackObject extends RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.IndicatorStack;
    readonly multiHit?: boolean;
}
export const isIndicatorStack = makeObjectTest<IndicatorStackObject>(ObjectType.IndicatorStack);

export interface IndicatorLineStackObject extends RegularResizableObject, ExtendableObject, BaseObject {
    readonly type: ObjectType.IndicatorLineStack;
}
export const isIndicatorLineStack = makeObjectTest<IndicatorLineStackObject>(ObjectType.IndicatorLineStack);

export interface IndicatorTargetingObject extends RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.IndicatorTargeting;
}
export const isIndicatorTargeting = makeObjectTest<IndicatorTargetingObject>(ObjectType.IndicatorTargeting);

export interface IndicatorTankbusterObject extends RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.IndicatorTankbuster;
}
export const isIndicatorTankbuster = makeObjectTest<IndicatorTankbusterObject>(ObjectType.IndicatorTankbuster);

export interface IndicatorProximityObject extends RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.IndicatorProximity;
}
export const isIndicatorProximity = makeObjectTest<IndicatorProximityObject>(ObjectType.IndicatorProximity);

export interface IndicatorMarkerObject extends RegularResizableObject, BaseObject {
    readonly type: ObjectType.IndicatorMarker;
    readonly iconId: number;
}
export const isIndicatorMarker = makeObjectTest<IndicatorMarkerObject>(ObjectType.IndicatorMarker);

export interface MechLinearKnockbackObject extends RegularResizableObject, ExtendableObject, BaseObject {
    readonly type: ObjectType.MechLinearKnockback;
}
export const isMechLinearKnockback = makeObjectTest<MechLinearKnockbackObject>(ObjectType.MechLinearKnockback);

export interface MechCircleExaflareObject extends RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.MechCircleExaflare;
    readonly length: number;
    readonly spacing: number;
}
export const isMechCircleExaflare = makeObjectTest<MechCircleExaflareObject>(ObjectType.MechCircleExaflare);

export interface MechCounterTowerObject extends StackCountObject, RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.MechCounterTower;
}
export const isMechCounterTower = makeObjectTest<MechCounterTowerObject>(ObjectType.MechCounterTower);

export interface MechTowerObject extends StackCountObject, RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.MechTower;
}
export const isMechTower = makeObjectTest<MechTowerObject>(ObjectType.MechTower);

export interface MechProximityObject extends RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.MechProximity;
}
export const isMechProximity = makeObjectTest<MechProximityObject>(ObjectType.MechProximity);

export interface MechRotationObject extends RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.MechRotation;
    readonly anticlockwise?: boolean;
}
export const isMechRotation = makeObjectTest<MechRotationObject>(ObjectType.MechRotation);

export interface MechRadialKnockbackObject extends RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.MechRadialKnockback;
}
export const isMechRadialKnockback = makeObjectTest<MechRadialKnockbackObject>(ObjectType.MechRadialKnockback);

export interface MechGazeObject extends RadiusObject, RotatableObject, BaseObject {
    readonly type: ObjectType.MechGaze;
    readonly invert?: boolean; // 是否反向
}
export const isMechGaze = makeObjectTest<MechGazeObject>(ObjectType.MechGaze);

export type Mechanics =
    | MechGazeObject
    | MechProximityObject
    | MechRadialKnockbackObject
    | MechLinearKnockbackObject
    | MechTowerObject
    | MechCounterTowerObject
    | MechCircleExaflareObject
    | MechRotationObject;

export type Indicators =
    | IndicatorStackObject
    | IndicatorLineStackObject
    | IndicatorTargetingObject
    | IndicatorTankbusterObject
    | IndicatorProximityObject
    | IndicatorMarkerObject;

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

export interface LineZone extends LineProps, MovableObject, ColoredObject, HollowObject, RotatableObject, BaseObject {
    readonly type: ObjectType.Line;
}
export const isLineZone = makeObjectTest<LineZone>(ObjectType.Line);

export interface FanProps {
    readonly fanAngle: number;
}

export interface FanZone extends FanProps, RadiusObject, ColoredObject, HollowObject, RotatableObject, BaseObject {
    readonly type: ObjectType.Fan;
}
export const isFanZone = makeObjectTest<FanZone>(ObjectType.Fan);

export interface ArcZone
    extends FanProps, RadiusObject, ColoredObject, HollowObject, RotatableObject, InnerRadiusObject, BaseObject {
    readonly type: ObjectType.Arc;
}
export const isArcZone = makeObjectTest<ArcZone>(ObjectType.Arc);

export interface RectangleZone extends ResizableObject, ColoredObject, HollowObject, BaseObject {
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

export interface PolygonProps {
    readonly sides: number;
    readonly orient: PolygonOrientation;
}

export interface PolygonZone
    extends PolygonProps, RadiusObject, ColoredObject, HollowObject, RotatableObject, BaseObject {
    readonly type: ObjectType.Polygon;
}
export const isPolygonZone = makeObjectTest<PolygonZone>(ObjectType.Polygon);

export interface ExaflareZone extends RadiusObject, RotatableObject, ColoredObject, BaseObject {
    readonly type: ObjectType.Exaflare;
    readonly length: number;
    readonly spacing: number;
}
export const isExaflareZone = makeObjectTest<ExaflareZone>(ObjectType.Exaflare);

export interface StarburstProps {
    readonly spokes: number;
    readonly spokeWidth: number;
}

export interface StarburstZone extends StarburstProps, RadiusObject, RotatableObject, ColoredObject, BaseObject {
    readonly type: ObjectType.Starburst;
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

export interface DrawObject extends ResizableObject, RotatableObject, ColoredObject, BaseObject {
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

export function isHorizontalFlippable<T>(object: T): object is HorizontalFlippable & T {
    const obj = object as HorizontalFlippable & T;
    return obj && typeof obj.flipHorizontal === 'boolean';
}

export function isVerticalFlippable<T>(object: T): object is VerticalFlippable & T {
    const obj = object as VerticalFlippable & T;
    return obj && typeof obj.flipVertical === 'boolean';
}

export function isFlippable<T>(object: T): object is FlippableObject & T {
    return isHorizontalFlippable(object) || isVerticalFlippable(object);
}

export function isHorizontalExtendable<T>(object: T): object is HorizontalExtendable & T {
    const obj = object as HorizontalExtendable & T;
    return obj && typeof obj.hNum === 'number';
}

export function isVerticalExtendable<T>(object: T): object is VerticalExtendable & T {
    const obj = object as VerticalExtendable & T;
    return obj && typeof obj.vNum === 'number';
}

export function isExtendable<T>(object: T): object is ExtendableObject & T {
    return isHorizontalExtendable(object) || isVerticalExtendable(object);
}

export function isLineLike<T>(object: T): object is LineProps & T {
    const obj = object as LineProps & T;
    return obj && typeof obj.length === 'number' && typeof obj.width === 'number';
}

export function isPolygonLike<T>(object: T): object is PolygonProps & T {
    const obj = object as PolygonProps & T;
    return obj && typeof obj.sides === 'number' && (obj.orient === 'point' || obj.orient === 'side');
}

export function isStarburstLike<T>(object: T): object is StarburstProps & T {
    const obj = object as StarburstProps & T;
    return obj && typeof obj.spokes === 'number' && typeof obj.spokeWidth === 'number';
}

export function isFanLike<T>(object: T): object is FanProps & T {
    const obj = object as FanProps & T;
    return obj && typeof obj.fanAngle === 'number';
}

export function isColored<T>(object: T): object is ColoredObject & T {
    const obj = object as ColoredObject & T;
    return obj && typeof obj.color === 'string';
}

export function isMovable<T>(object: T): object is MovableObject & T {
    const obj = object as MovableObject & T;
    return obj && typeof obj.x === 'number' && typeof obj.y === 'number';
}

export function isRotatable<T>(object: T): object is RotatableObject & T {
    const obj = object as RotatableObject & T;
    return obj && typeof obj.rotation === 'number';
}

export function isResizable<T>(object: T): object is ResizableObject & T {
    if (!isMovable(object) || !isRotatable(object)) {
        return false;
    }

    const obj = object as ResizableObject & T;
    return obj && typeof obj.width === 'number' && typeof obj.height === 'number';
}

export function isRegularResizable<T>(object: T): object is RegularResizableObject & T {
    if (!isMovable(object) || !isRotatable(object)) {
        return false;
    }

    const obj = object as RegularResizableObject & T;
    return obj && typeof obj.size === 'number';
}

export function isRadiusObject<T>(object: T): object is RadiusObject & T {
    if (!isMovable(object)) {
        return false;
    }

    const obj = object as RadiusObject & T;
    return obj && typeof obj.radius === 'number';
}

export function isInnerRadiusObject<T>(object: T): object is InnerRadiusObject & T {
    if (!isMovable(object)) {
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
    | WaymarkGroupObject
    | Aoe
    | Mechanics
    | Indicators
    | EnemyObject
    | Asset;

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
