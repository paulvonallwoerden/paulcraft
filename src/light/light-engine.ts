import { Vector3 } from 'three';
import { BlockPos, isBlockPosIn, modifyBlockPosValues } from '../block/block-pos';
import { indexToPos, posToIndex } from '../util/index-to-vector3';
import { mod } from '../util/mod';
import { Chunk } from '../world/chunk';
import { ChunkColumnManager } from '../world/chunk-column-manager';

interface LightNode {
    chunk: Chunk;
    index: number;
}

interface LightRemovalNode {
    chunk: Chunk;
    index: number;
    lightLevel: number;
}

const BLOCK_NEIGHBOR_OFFSETS = [
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1),
];

/**
 * A light engine that uses a flood fill algorithm based on BFS to calculate light levels.
 */
export class LightEngine {
    private readonly lightQueue: LightNode[] = [];
    private readonly lightRemovalQueue: LightRemovalNode[] = [];

    public constructor(
        protected readonly chunkColumnManager: ChunkColumnManager,
        protected readonly setLightLevel: (chunk: Chunk, pos: BlockPos, lightLevel: number) => void,
        protected readonly getLightLevel: (chunk: Chunk, pos: BlockPos) => number,
    ) {}

    public addLight(pos: BlockPos, lightLevel: number): void {
        const chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            throw new Error('Cannot add light to a block that isn\'t in a loaded chunk!');
        }

        const localPos = modifyBlockPosValues(pos, (v) => mod(v, 16));
        this.setLightLevel(chunk, localPos, lightLevel);
        this.lightQueue.push({ chunk, index: posToIndex(localPos) });
    }

    public fillLight(pos: BlockPos): void {
        const chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            throw new Error('Cannot add light to a block that isn\'t in a loaded chunk!');
        }

        const localPos = modifyBlockPosValues(pos, (v) => mod(v, 16));
        const neighborLightLevels = BLOCK_NEIGHBOR_OFFSETS.map(
            (offset) => this.getLightLevelAtRelativeChunkPosition(chunk, localPos, offset)?.lightLevel ?? 0 - this.calculateLightLoss(offset),
        );
        const lightLevel = Math.max(0, Math.max(...neighborLightLevels));

        this.setLightLevel(chunk, localPos, lightLevel);
        this.lightQueue.push({ chunk, index: posToIndex(localPos) });
    }

    public removeLight(pos: BlockPos): void {
        const chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            throw new Error('Cannot add light to a block that isn\'t in a loaded chunk!');
        }

        const localPos = modifyBlockPosValues(pos, (v) => mod(v, 16));
        const lightLevel = this.getLightLevel(chunk, localPos);
        this.lightRemovalQueue.push({ chunk, index: posToIndex(localPos), lightLevel });
        this.setLightLevel(chunk, localPos, 0);
    }

    public run() {
        this.diminishLight();
        this.propagateLight();
    }

    protected calculateLightLoss(direction: BlockPos): number {
        return 1;
    }

    private propagateLight() {
        while (this.lightQueue.length > 0) {
            const { chunk, index } = this.lightQueue.shift()!;
            const pos = indexToPos(index);
            const lightLevel = this.getLightLevel(chunk, pos);

            BLOCK_NEIGHBOR_OFFSETS.forEach((offset: Vector3) => {
                let curChunk: Chunk | undefined = chunk;
                let curPos: BlockPos = pos.clone().add(offset);
                if (!isBlockPosIn(curPos, { x: 0, y: 0, z: 0}, { x: 15, y: 15, z: 15})) {
                    curPos = modifyBlockPosValues(curPos, (v) => mod(v, 16));
                    curChunk = this.chunkColumnManager.getChunk(chunk.position.clone().add(offset));
                    if (!curChunk) {
                        return;
                    }
                }

                const blocksLight = curChunk.getBlock([curPos.x, curPos.y, curPos.z])!.blocksLight;
                const curLightLevel = this.getLightLevel(curChunk, curPos);
                if (!blocksLight && curLightLevel + 2 <= lightLevel) {
                    this.setLightLevel(curChunk, curPos, lightLevel - this.calculateLightLoss(offset));
                    this.lightQueue.push({ chunk: curChunk, index: posToIndex(curPos) });
                }
            });
        }
    }

    private diminishLight() {
        while (this.lightRemovalQueue.length > 0) {
            const { chunk, lightLevel, index } = this.lightRemovalQueue.shift()!;
            const pos = indexToPos(index);

            BLOCK_NEIGHBOR_OFFSETS.forEach((offset: Vector3) => {
                let curChunk: Chunk | undefined = chunk;
                let curPos: BlockPos = pos.clone().add(offset);
                if (!isBlockPosIn(curPos, { x: 0, y: 0, z: 0}, { x: 15, y: 15, z: 15})) {
                    curPos = modifyBlockPosValues(curPos, (v) => mod(v, 16));
                    curChunk = this.chunkColumnManager.getChunk(chunk.position.clone().add(offset));
                    if (!curChunk) {
                        return;
                    }
                }

                const curLightLevel = this.getLightLevel(curChunk, curPos);
                if (curLightLevel !== 0 && curLightLevel < lightLevel) {
                    this.setLightLevel(curChunk, curPos, 0);
                    this.lightRemovalQueue.push({ chunk: curChunk, lightLevel: curLightLevel, index: posToIndex(curPos) });
                } else if (curLightLevel >= lightLevel) {
                    this.lightQueue.push({ chunk: curChunk, index: posToIndex(curPos) });
                }
            });
        }
    }

    private getLightLevelAtRelativeChunkPosition(chunk: Chunk, pos: BlockPos, offset: Vector3): { lightLevel: number, chunk: Chunk } | undefined {
        let curChunk: Chunk | undefined = chunk;
        let curPos: BlockPos = { x: pos.x + offset.x, y: pos.y + offset.y, z: pos.z + offset.z };
        if (!isBlockPosIn(curPos, { x: 0, y: 0, z: 0}, { x: 15, y: 15, z: 15})) {
            curPos = modifyBlockPosValues(curPos, (v) => mod(v, 16));
            curChunk = this.chunkColumnManager.getChunk(chunk.position.clone().add(offset));
            if (!curChunk) {
                return;
            }
        }

        return {
            lightLevel: this.getLightLevel(curChunk, curPos),
            chunk: curChunk,
        };
    }
}
