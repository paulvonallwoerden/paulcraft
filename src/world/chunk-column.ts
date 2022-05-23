import { Mesh, Scene, Vector3, Vector3Tuple } from 'three';
import { ITickable } from '../tickable';
import { Chunk, CHUNK_HEIGHT } from './chunk';
import { ChunkColumnManager } from './chunk-column-manager';
import { Block } from '../block/block';

export class ChunkColumn implements ITickable {    
    public readonly chunks: Chunk[] = [];

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
        
        return this.chunks[chunkLocalY].setBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z], block);
    }

    public getBlockAt([x, y, z]: Vector3Tuple): Block | undefined {
        const chunkLocalY = Math.floor(y / CHUNK_HEIGHT);
        if (!this.chunks[chunkLocalY]) {
            return undefined;
        }

        return this.chunks[chunkLocalY].getBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z]);
    }

    public getChunkMeshes(): Mesh[] {
        return this.chunks.flatMap((chunk) => [chunk.solidMesh, chunk.transparentMesh]).filter((chunk) => chunk !== undefined);
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
}
