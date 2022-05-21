import { Vector2 } from "three";
export function indexToXZ(index, size) {
    var x = index % size;
    var y = Math.floor(index / size);
    return new Vector2(x, y);
}
export function xzTupelToIndex(x, y, size) {
    return x + y * size;
}
