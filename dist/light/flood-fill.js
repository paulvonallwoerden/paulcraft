import { isBlockPosIn } from '../block/block-pos';
import { posToIndex } from '../util/index-to-vector3';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from '../world/chunk/chunk-constants';
export function manhattenDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
}
export function floodFillBlockLightAdditive(lightLevels, start, strength, isLightBlockerAt) {
    flood(start, start, lightLevels, strength, isLightBlockerAt, new Map());
}
function flood(pos, start, lightLevels, strength, isLightBlockerAt, visited) {
    var _a;
    var lightLevel = strength - manhattenDistance(start, pos);
    if (lightLevel <= 0) {
        return;
    }
    if (isLightBlockerAt(pos)) {
        return;
    }
    if (isBlockPosIn(pos, { x: 0, y: 0, z: 0 }, { x: CHUNK_WIDTH - 1, y: CHUNK_HEIGHT - 1, z: CHUNK_WIDTH - 1 })) {
        if (lightLevels[posToIndex(pos)] >= lightLevel) {
            return;
        }
        lightLevels[posToIndex(pos)] = lightLevel;
    }
    else if (isBlockPosIn(pos, { x: -16, y: -16, z: -16 }, { x: 31, y: 31, z: 31 })) {
        var posKey = posToIndex({ x: pos.x + 16, y: pos.y + 16, z: pos.z + 16 }, 48);
        if ((_a = visited.get(posKey)) !== null && _a !== void 0 ? _a : 0 >= lightLevel) {
            return;
        }
        visited.set(posKey, lightLevel);
    }
    else {
        return;
    }
    if (lightLevel - 1 <= 0) {
        return;
    }
    flood({ x: pos.x + 1, y: pos.y, z: pos.z }, start, lightLevels, strength, isLightBlockerAt, visited);
    flood({ x: pos.x - 1, y: pos.y, z: pos.z }, start, lightLevels, strength, isLightBlockerAt, visited);
    flood({ x: pos.x, y: pos.y + 1, z: pos.z }, start, lightLevels, strength, isLightBlockerAt, visited);
    flood({ x: pos.x, y: pos.y - 1, z: pos.z }, start, lightLevels, strength, isLightBlockerAt, visited);
    flood({ x: pos.x, y: pos.y, z: pos.z + 1 }, start, lightLevels, strength, isLightBlockerAt, visited);
    flood({ x: pos.x, y: pos.y, z: pos.z - 1 }, start, lightLevels, strength, isLightBlockerAt, visited);
}
