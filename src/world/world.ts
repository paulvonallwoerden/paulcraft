import { Mesh, Scene } from "three";
import { Block } from "../block/block";
import { STONE_BLOCK_ID, SUGAR_CANE_BLOCK_ID } from "../block/block-ids";
import { BlockPos } from "../block/block-pos";
import { mod } from "../util/mod";
import { ChunkColumn } from "./chunk-column";
import { ChunkColumnManager } from "./chunk-column-manager";

export class World {
    private readonly chunkColumnManager: ChunkColumnManager;

    public constructor(readonly scene: Scene) {
        this.chunkColumnManager = new ChunkColumnManager(scene, 7, 5);
        // this.chunkColumnManager = new ChunkColumnManager(scene, 14, 3);
    }

    public async init() {
        this.chunkColumnManager.setCenter(0, 0);
    }

    public tick(deltaTime: number) {
        this.chunkColumnManager.tick(deltaTime);
    }

    public lateUpdate(deltaTime: number) {
        this.chunkColumnManager.lateUpdate(deltaTime);
    }

    public setPlayerChunk(x: number, z: number) {
        this.chunkColumnManager.setCenter(x, z);
    }

    public setBlock(pos: BlockPos, block: Block) {
        const chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            return undefined;
        }

        return chunk.setBlock(
            [
                mod(pos.x, 16),
                mod(pos.y, 16),
                mod(pos.z, 16),
            ],
            block.id,
        );
    }

    public getBlock(pos: BlockPos): number | undefined {
        const chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            return undefined;
        }

        return chunk.getBlock([
            mod(pos.x, 16),
            mod(pos.y, 16),
            mod(pos.z, 16),
        ]);
    }

    public __tempGetChunkMeshes(): Mesh[] {
        return this.chunkColumnManager.__tempGetChunkMeshes();
    }
}
