import Konva from 'konva';
import type { ShapeConfig } from 'konva/lib/Shape';
import React, { useEffect, useRef } from 'react';
import { Group } from 'react-konva';

export const STROKE_WIDTH = Konva.pixelRatio * 2;

type ReactKonvaExports = typeof import('react-konva');
type ReactKonvaShapeCtor =
    | ReactKonvaExports['Arc']
    | ReactKonvaExports['Arrow']
    | ReactKonvaExports['Circle']
    | ReactKonvaExports['Ellipse']
    | ReactKonvaExports['Line']
    | ReactKonvaExports['Path']
    | ReactKonvaExports['Rect']
    | ReactKonvaExports['RegularPolygon']
    | ReactKonvaExports['Ring']
    | ReactKonvaExports['Star']
    | ReactKonvaExports['Wedge']
    | ReactKonvaExports['Shape'];

type ReactKonvaShapeElement = React.ReactElement<ShapeConfig, ReactKonvaShapeCtor>;

interface GlowProps {
    children: ReactKonvaShapeElement;
    color: string;
    blurRadius: number;
    shadowOpacity: number;
    // 性能优化：只在这些keys改变时重新渲染阴影和缓存，不同形状根据自己情况传入相应的keys
    cacheKeys?: unknown[];
}

function Glow({ children, color, blurRadius, shadowOpacity, cacheKeys }: GlowProps) {
    const groupRef = useRef<Konva.Group>(null);

    useEffect(() => {
        const group = groupRef.current;
        if (!group) return;

        // 对阴影形状应用高斯模糊，并缓存其位图。
        const childrenNodes = group.getChildren();
        const shadow = childrenNodes[1] as Konva.Shape | undefined;
        if (shadow) {
            shadow.cache();
            shadow.filters([Konva.Filters.Blur]);
            shadow.blurRadius(blurRadius * Konva.pixelRatio);
        }

        // Cache the whole group so destination-out composition works within the group context.
        // IMPORTANT: do NOT depend on `children` here; its identity changes frequently
        // during interactive edits and would cause expensive re-caching.
        group.cache();
    }, [color, blurRadius, shadowOpacity, cacheKeys]);

    const base = React.cloneElement(children, {
        fill: color,
        stroke: color,
        strokeWidth: STROKE_WIDTH,
        opacity: 1,
        listening: false,
    });

    const shadow = React.cloneElement(children, {
        fill: color,
        shadowColor: color,
        shadowBlur: 32,
        shadowOpacity,
        shadowOffset: { x: 0, y: 0 },
        opacity: 1,
        globalCompositeOperation: 'destination-out',
        listening: false,
    });

    return (
        <Group ref={groupRef} listening={false}>
            {base}
            {shadow}
        </Group>
    );
}

function InnerGlow({
    children,
    color = '#ff751f',
    opacity = 1,
    cacheKeys,
}: {
    children: ReactKonvaShapeElement;
    color?: string;
    opacity?: number;
    cacheKeys?: unknown[];
}) {
    return (
        <Group listening={false} opacity={opacity}>
            <Glow color={color} blurRadius={16} shadowOpacity={0.1} cacheKeys={cacheKeys}>
                {children}
            </Glow>
            <Glow color={color} blurRadius={32} shadowOpacity={0.1} cacheKeys={cacheKeys}>
                {children}
            </Glow>
        </Group>
    );
}

function OuterGlow({
    children,
    color = '#fffc79',
    opacity = 1,
    cacheKeys,
}: {
    children: ReactKonvaShapeElement;
    color?: string;
    opacity?: number;
    cacheKeys?: unknown[];
}) {
    return (
        <Group listening={false} opacity={opacity}>
            <Glow color={color} blurRadius={4} shadowOpacity={1} cacheKeys={cacheKeys}>
                {children}
            </Glow>
            <Glow color={color} blurRadius={8} shadowOpacity={1} cacheKeys={cacheKeys}>
                {children}
            </Glow>
        </Group>
    );
}

export function AoeEffect({
    children,
    opacity = 1,
    baseColor = '#fb923c',
    baseOpacity = 0.25,
    innerGlowColor = '#ff751f',
    innerGlowOpacity = 1,
    outerGlowColor = '#fffc79',
    outerGlowOpacity = 1,
    cacheKeys,
}: {
    children: ReactKonvaShapeElement;
    opacity?: number;
    baseColor?: string;
    baseOpacity?: number;
    innerGlowColor?: string;
    innerGlowOpacity?: number;
    outerGlowColor?: string;
    outerGlowOpacity?: number;
    cacheKeys?: unknown[];
}) {
    const base = React.cloneElement(children, { fill: baseColor, opacity: baseOpacity });

    return (
        <Group opacity={opacity}>
            {base}
            <InnerGlow color={innerGlowColor} opacity={innerGlowOpacity} cacheKeys={cacheKeys}>
                {children}
            </InnerGlow>
            <OuterGlow color={outerGlowColor} opacity={outerGlowOpacity} cacheKeys={cacheKeys}>
                {children}
            </OuterGlow>
        </Group>
    );
}
