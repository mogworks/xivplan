import Color from 'colorjs.io';

function getStrokeWidth(size: number) {
    return Math.max(2, Math.min(4, size / 100));
}

export function getAoeStyle(
    color: string,
    opacity: number,
    size = 0,
): { fill: string; stroke: string; strokeWidth: number } {
    const strokeWidth = getStrokeWidth(size);
    const c = new Color(color);

    // TODO: update to c.set({ alpha: value }) once colorjs.io v0.6.0 is released
    const fill = c.clone();
    fill.alpha = opacity / 100;
    const fillStr = fill.display();

    const stroke = c.clone();
    stroke.alpha = opacity / 50;
    const strokeStr = stroke.display();

    return { fill: fillStr, stroke: strokeStr, strokeWidth };
}
