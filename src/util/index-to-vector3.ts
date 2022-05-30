import { Vector3 } from "three";
import { BlockPos } from "../block/block-pos";
import { CHUNK_WIDTH } from "../world/chunk/chunk-constants";

export function indexToXZY(index: number, xSize: number, zSize: number): Vector3 {
    const x = index % xSize;
    const y = Math.floor(index / (xSize * zSize));
    const z = Math.floor(index / xSize) - zSize * y;

    return new Vector3(x, y, z);
}

export function xzyToIndex(vector: BlockPos, xSize: number, zSize: number): number {
    return vector.x + vector.z * xSize + vector.y * xSize * zSize;
}

export function xyzTupelToIndex(x: number, y: number, z: number, xSize: number, zSize: number): number {
    return x + z * xSize + y * xSize * zSize;
}

export function indexToPos(index: number, base = CHUNK_WIDTH) {
    const x = index % base;
    const y = Math.floor(index / (base * base));
    const z = Math.floor(index / base) - base * y;

    return new Vector3(x, y, z);    
}

export function posToIndex({ x, z, y }: BlockPos, base = CHUNK_WIDTH) {
    return (x) + (z * base) + (y * base * base);
}
