import { Vector2 } from "three";

export function indexToXZ(index: number, size: number): Vector2 {
    const x = index % size;
    const y = Math.floor(index / size);

    return new Vector2(x, y);
}

export function xzTupelToIndex(x: number, y: number, size: number): number {
    return x + y * size;
}
