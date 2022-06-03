import { BlockPos } from '../block/block-pos';
import { Chunk } from '../world/chunk';
import { ChunkColumnManager } from '../world/chunk-column-manager';
import { LightEngine } from './light-engine';

export class BlockLightEngine extends LightEngine {
    public constructor(chunkColumnManager: ChunkColumnManager) {
        super(chunkColumnManager, BlockLightEngine.setBlockLight, BlockLightEngine.getBlockLight);
    }

    protected static setBlockLight(chunk: Chunk, pos: BlockPos, lightLevel: number): void {
        chunk.setBlockLight(pos, lightLevel);
    }

    protected static getBlockLight(chunk: Chunk, pos: BlockPos): number {
        return chunk.getBlockLight(pos);
    }
}
