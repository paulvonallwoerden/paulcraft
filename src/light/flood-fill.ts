import { BlockPos, isBlockPosIn } from '../block/block-pos';
import { posToIndex } from '../util/index-to-vector3';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from '../world/chunk/chunk-constants';

type IsLightBlockerAt = (pos: BlockPos) => boolean;

export function manhattenDistance(a: BlockPos, b: BlockPos): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
}

export function floodFillBlockLightAdditive(lightLevels: Uint8Array, start: BlockPos, strength: number, isLightBlockerAt: IsLightBlockerAt): void {
    flood(start, start, lightLevels, strength, isLightBlockerAt, new Map<number, number>());
}

function flood(
    pos: BlockPos,
    start: BlockPos,
    lightLevels: Uint8Array,
    strength: number,
    isLightBlockerAt: IsLightBlockerAt,
    visited: Map<number, number>,
) {
    const lightLevel = strength - manhattenDistance(start, pos);
    if (lightLevel <= 0) {
        return;
    }

    if (isLightBlockerAt(pos)) {
        return;
    }

    if (isBlockPosIn(pos, { x: -1, y: -1, z: -1 }, { x: CHUNK_WIDTH, y: CHUNK_HEIGHT, z: CHUNK_WIDTH })) {
        if (lightLevels[posToIndex(pos, 18)] >= lightLevel) {
            return;
        }
    
        lightLevels[posToIndex(pos, 18)] = lightLevel;
    } else if (isBlockPosIn(pos, { x: -16, y: -16, z: -16 }, { x: 31, y: 31, z: 31 })) {
        const posKey = posToIndex({ x: pos.x + 17, y: pos.y + 17, z: pos.z + 17 }, 50);
        if (visited.get(posKey) ?? 0 >= lightLevel) {
            return;
        }

        visited.set(posKey, lightLevel);
    } else {
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
