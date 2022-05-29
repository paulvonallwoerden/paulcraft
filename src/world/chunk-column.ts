import { Mesh, Scene, Vector3, Vector3Tuple } from 'three';
import { ITickable } from '../tickable';
import { Chunk, CHUNK_HEIGHT } from './chunk';
import { ChunkColumnManager } from './chunk-column-manager';
import { Block } from '../block/block';
import { Game } from '../game';
import { BlockPos } from '../block/block-pos';
import { CHUNK_WIDTH } from './chunk/chunk-constants';
import { indexToPos, posToIndex } from '../util/index-to-vector3';
import { mod } from '../util/mod';

export class ChunkColumn implements ITickable {    
    public readonly chunks: Chunk[] = [];

    private skyLight = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_WIDTH * 8);
    private spilledBlockData?: Uint8Array;

    public constructor(
        private readonly manager: ChunkColumnManager,
        public readonly position: [number, number],
        height: number,
    ) {
        for (let i = 0; i < height; i++) {
            this.chunks.push(new Chunk(this, new Vector3(position[0], i, position[1])));
        }
    }

    public register(scene: Scene) {
        this.chunks.forEach((chunk) => chunk.register(scene));
    }

    public unregister(scene: Scene) {
        this.chunks.forEach((chunk) => chunk.unregister(scene));
    }

    public async generatePrototype() {}

    public onTick(deltaTime: number): void {
        this.chunks.forEach((chunk) => {
            chunk.onTick(deltaTime);
            chunk.tickBlocks();
        });
    }

    public lateUpdate(deltaTime: number) {
        this.chunks.forEach((chunk) => chunk.lateUpdate(deltaTime));
    }

    public setBlockAt([x, y, z]: Vector3Tuple, block: Block): void {
        const chunkLocalY = Math.floor(y / CHUNK_HEIGHT);
        if (chunkLocalY < 0 || chunkLocalY >= this.chunks.length) {
            return;
        }

        const oldBlock = this.getBlockAt([x, y, z]);
        this.chunks[chunkLocalY].setBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z], block);

        // TODO: Run this async and NOT sync! Important!
        if (oldBlock !== block && (oldBlock?.blocksLight !== block.blocksLight)) {
            this.calculateSkyLight();
        }
    }

    public getBlockAt([x, y, z]: Vector3Tuple): Block | undefined {
        const chunkLocalY = Math.floor(y / CHUNK_HEIGHT);
        if (!this.chunks[chunkLocalY]) {
            return undefined;
        }

        return this.chunks[chunkLocalY].getBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z]);
    }

    public async decorateTerrain(): Promise<void> {
        const decoratedBlocks = await Game.main.chunkGeneratorPool.decorateTerrain(this.position,
            this.chunks.map((chunk) => chunk.getBlockData()),
        );
        this.chunks.forEach((chunk, i) => chunk.setBlockData(decoratedBlocks[i]));

        this.calculateSkyLight();
    }

    public getChunkMeshes(): Mesh[] {
        return this.chunks.flatMap((chunk) => [chunk.solidMesh, chunk.transparentMesh, chunk.foliageMesh]).filter((chunk) => chunk !== undefined);
    }

    public getChunk(absolutePos: [number, number, number]): Chunk | undefined {
        if (this.position[0] === absolutePos[0] && this.position[1] === absolutePos[2]) {
            return this.chunks[absolutePos[1]];
        }

        const neighborColumn = this.manager.getChunkColumn(absolutePos[0], absolutePos[2]);
        if (!neighborColumn) {
            return undefined;
        }

        return neighborColumn.chunks[absolutePos[1]];
    }

    public spillBlockData(blockData: Uint8Array) {
        this.spilledBlockData = blockData;   
    }

    public getSpilledBlockData(): Uint8Array | undefined {
        return this.spilledBlockData;
    }

    public calculateSkyLight() {
        this.skyLight = new Uint8Array(this.skyLight.length);
        for (let x = 0; x < CHUNK_WIDTH; x += 1) {
            for (let z = 0; z < CHUNK_WIDTH; z += 1) {
                for (let y = CHUNK_WIDTH * 8 - 1; y >= 0; y -= 1) {
                    const pos: BlockPos = { x, y, z };
                    if (this.getBlockAt([mod(x, 16), y, mod(z, 16)])!.blocksLight) {
                        break;
                    }

                    this.skyLight[posToIndex(pos)] = 15;
                }
            }
        }
    }

    public getSkyLight() {
        return this.skyLight;
    }
}
