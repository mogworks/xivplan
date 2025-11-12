import Konva from 'konva';
import type { ShapeConfig } from 'konva/lib/Shape';
import React, { useEffect, useRef } from 'react';
import { Group } from 'react-konva';
import { useDebounceValue } from 'usehooks-ts';
import { NativeStyle } from './nativeStyle';

type ReactKonvaExports = typeof import('react-konva');
type ReactKonvaShapeCtor =
    | ReactKonvaExports['Arc']
    | ReactKonvaExports['Circle']
    | ReactKonvaExports['Line']
    | ReactKonvaExports['Rect']
    | ReactKonvaExports['RegularPolygon']
    | ReactKonvaExports['Ring']
    | ReactKonvaExports['Wedge']
    | ReactKonvaExports['Shape'];

type ReactKonvaShapeElement = React.ReactElement<ShapeConfig, ReactKonvaShapeCtor>;

interface GlowProps {
    children: ReactKonvaShapeElement;
    color: string;
    blurRadius: number;
    shadowOpacity: number;
}

function Glow({ children, color, blurRadius, shadowOpacity }: GlowProps) {
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
        group.cache();
    }, [children, color, blurRadius, shadowOpacity]);

    const base = React.cloneElement(children, {
        fill: color,
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
}: {
    children: ReactKonvaShapeElement;
    color?: string;
    opacity?: number;
}) {
    return (
        <Group listening={false} opacity={opacity}>
            <Glow color={color} blurRadius={16} shadowOpacity={0.1}>
                {children}
            </Glow>
            <Glow color={color} blurRadius={24} shadowOpacity={0.1}>
                {children}
            </Glow>
            <Glow color={color} blurRadius={32} shadowOpacity={0.1}>
                {children}
            </Glow>
        </Group>
    );
}

function Outerline({
    children,
    color = '#fffc79',
    opacity = 1,
}: {
    children: ReactKonvaShapeElement;
    color?: string;
    opacity?: number;
}) {
    return (
        <Group listening={false} opacity={opacity}>
            <Glow color={color} blurRadius={4} shadowOpacity={1}>
                {children}
            </Glow>
            <Glow color={color} blurRadius={7} shadowOpacity={1}>
                {children}
            </Glow>
            <Glow color={color} blurRadius={10} shadowOpacity={1}>
                {children}
            </Glow>
        </Group>
    );
}

interface AoeEffectProps extends NativeStyle {
    children: ReactKonvaShapeElement;
    freeze?: boolean;
}

export const AoeEffect = React.memo(
    function AoeEffect({
        children,
        globalOpacity = 1,
        baseColor = '#fb923c',
        baseOpacity = 0.25,
        innerGlowColor = '#ff751f',
        innerGlowOpacity = 1,
        outlineColor = '#fffc79',
        outlineOpacity = 1,
    }: AoeEffectProps) {
        // 性能优化，避免频繁渲染阴影和滤镜
        const [debouncedChildren] = useDebounceValue(children, 250);
        const [debouncedInnerGlowColor] = useDebounceValue(innerGlowColor, 100);
        const [debouncedInnerGlowOpacity] = useDebounceValue(innerGlowOpacity, 250);
        const [debouncedOutlineColor] = useDebounceValue(outlineColor, 100);
        const [debouncedOutlineOpacity] = useDebounceValue(outlineOpacity, 250);

        const base = React.cloneElement(debouncedChildren, { fill: baseColor, opacity: baseOpacity });

        return (
            <Group opacity={globalOpacity}>
                {base}
                <InnerGlow color={debouncedInnerGlowColor} opacity={debouncedInnerGlowOpacity}>
                    {debouncedChildren}
                </InnerGlow>
                <Outerline color={debouncedOutlineColor} opacity={debouncedOutlineOpacity}>
                    {debouncedChildren}
                </Outerline>
            </Group>
        );
    },
    (prev: AoeEffectProps, next: AoeEffectProps) => {
        // freeze 为 true 时，不触发重新渲染，可让外部通过传入 freeze 控制是否重新渲染
        return !!next.freeze;
    },
);
