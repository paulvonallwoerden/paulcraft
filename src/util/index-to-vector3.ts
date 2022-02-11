import { Vector3 } from "three";

export function indexToXZY(index: number, xSize: number, zSize: number): Vector3 {
    const x = index % xSize;
    const y = Math.floor(index / (xSize * zSize));
    const z = Math.floor(index / xSize) - zSize * y;

    return new Vector3(x, y, z);
}

export function xzyToIndex(vector: Vector3, xSize: number, zSize: number): number {
    return vector.x + vector.z * xSize + vector.y * xSize * zSize;
}

export function xyzTupelToIndex(x: number, y: number, z: number, xSize: number, zSize: number): number {
    return x + z * xSize + y * xSize * zSize;
}
