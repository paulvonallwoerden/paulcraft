import { Vector3 } from "three";
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
