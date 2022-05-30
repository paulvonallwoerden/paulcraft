import { Vector3 } from "three";
import { CHUNK_WIDTH } from "../world/chunk/chunk-constants";
export function indexToXZY(index, xSize, zSize) {
    var x = index % xSize;
    var y = Math.floor(index / (xSize * zSize));
    var z = Math.floor(index / xSize) - zSize * y;
    return new Vector3(x, y, z);
}
export function xzyToIndex(vector, xSize, zSize) {
    return vector.x + vector.z * xSize + vector.y * xSize * zSize;
}
export function xyzTupelToIndex(x, y, z, xSize, zSize) {
    return x + z * xSize + y * xSize * zSize;
}
export function indexToPos(index, base) {
    if (base === void 0) { base = CHUNK_WIDTH; }
    var x = index % base;
    var y = Math.floor(index / (base * base));
    var z = Math.floor(index / base) - base * y;
    return new Vector3(x, y, z);
}
export function posToIndex(_a, base) {
    var x = _a.x, z = _a.z, y = _a.y;
    if (base === void 0) { base = CHUNK_WIDTH; }
    return (x) + (z * base) + (y * base * base);
}
