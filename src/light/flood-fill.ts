import { BlockPos, isBlockPosIn } from "../block/block-pos";
import { Blocks } from "../block/blocks";
import { posToIndex } from "../util/index-to-vector3";
import { CHUNK_WIDTH, CHUNK_HEIGHT } from "../world/chunk/chunk-constants";

export function manhattenDistance(a: BlockPos, b: BlockPos): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
}

export function floodFillBlockLight(blocks: Uint8Array, start: BlockPos, strength: number): Uint8Array {
    const lightLevels = new Uint8Array(blocks.length);
    floodFillPart(blocks, start, strength + 1, lightLevels);

    return lightLevels;
}

export function floodFillBlockLightAdditive(lightLevels: Uint8Array, blocks: Uint8Array, start: BlockPos, strength: number): void {
    floodFillPart(blocks, start, strength + 1, lightLevels);
}

function floodFillPart(blocks: Uint8Array, pos: BlockPos, strength: number, lightLevels: Uint8Array): void {
    const lightLevel = strength - 1;
    if (lightLevel <= 0) {
        return;
    }

    const index = posToIndex(pos);
    if (lightLevels[index] >= lightLevel) {
        return;
    }

    if (!isBlockPosIn(pos, { x: 0, y: 0, z: 0 }, { x: CHUNK_WIDTH - 1, y: CHUNK_HEIGHT - 1, z: CHUNK_WIDTH - 1 })) {
        return;
    }

    if (Blocks.getBlockById(blocks[index]).blocksLight) {
        return;
    }

    lightLevels[index] = lightLevel;

    floodFillPart(blocks, { x: pos.x + 1, y: pos.y, z: pos.z }, lightLevel, lightLevels);
    floodFillPart(blocks, { x: pos.x - 1, y: pos.y, z: pos.z }, lightLevel, lightLevels);
    floodFillPart(blocks, { x: pos.x, y: pos.y + 1, z: pos.z }, lightLevel, lightLevels);
    floodFillPart(blocks, { x: pos.x, y: pos.y - 1, z: pos.z }, lightLevel, lightLevels);
    floodFillPart(blocks, { x: pos.x, y: pos.y, z: pos.z + 1 }, lightLevel, lightLevels);
    floodFillPart(blocks, { x: pos.x, y: pos.y, z: pos.z - 1 }, lightLevel, lightLevels);
}
